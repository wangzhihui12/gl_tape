/**
 * App 动态表单 — jsonContent / fieldDataList / subformDataList
 * App 工程复制本文件即可，无其它依赖
 * @see packageDynamicForm/docs/daily-report-save-and-json.md
 * @see packageDynamicForm/docs/field-options-api.md
 */

/** true：fieldDataList 双写 subform 行（groupKey/rowIndex）；false：仅 subformDataList */
const FIELD_DATA_LIST_INCLUDE_SUBFORM_ROWS = false
/** true：无行数据时为每个可见 subform 区块写入 fieldType=subform 占位；false：仅写有值行 */
const FIELD_DATA_LIST_INCLUDE_SUBFORM_SECTIONS = false

// --- 内联工具（与 field-submit-value / group-row-adapter 等保持同步） ---

function cloneJson(data) {
	return JSON.parse(JSON.stringify(data))
}

function isPlainObject(value) {
	return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isSelectObject(rawValue) {
	return rawValue != null && typeof rawValue === 'object' && !Array.isArray(rawValue)
}

function coerceSelectValue(rawValue) {
	if (rawValue == null || rawValue === '') {
		return rawValue
	}
	if (isSelectObject(rawValue)) {
		const id = rawValue.id ?? rawValue.value
		return id == null || id === '' ? '' : String(id)
	}
	if (Array.isArray(rawValue)) {
		const first = rawValue.find(v => v != null && v !== '')
		if (first == null) return ''
		if (isSelectObject(first)) {
			const id = first.id ?? first.value
			return id == null || id === '' ? '' : String(id)
		}
		return String(first)
	}
	return String(rawValue)
}

function normalizeMultipleSelectItem(item) {
	if (item == null || item === '') {
		return null
	}
	if (typeof item === 'object') {
		return item
	}
	return String(item)
}

function coerceMultipleSelectValue(rawValue) {
	if (rawValue == null || rawValue === '') {
		return rawValue
	}
	if (Array.isArray(rawValue)) {
		return rawValue.map(normalizeMultipleSelectItem).filter(Boolean)
	}
	if (typeof rawValue === 'string') {
		const trimmed = rawValue.trim()
		if (trimmed.startsWith('[')) {
			try {
				const parsed = JSON.parse(trimmed)
				if (Array.isArray(parsed)) {
					return parsed.map(normalizeMultipleSelectItem).filter(Boolean)
				}
			} catch (error) {
				// fall through
			}
		}
		return trimmed ? [trimmed] : []
	}
	return [String(rawValue)]
}

const CAR_BRAND_FIELD_KEYS = [
	'vehicleBrandId',
	'vehicleBrandName',
	'vehicleSubBrandId',
	'vehicleSubBrandName',
	'vehicleSeriesId',
	'vehicleSeriesName',
	'vehicleShapeId',
	'vehicleShapeName'
]

const CASCADE_LEVEL_SPECS = [
	{ idKey: 'vehicleBrandId', nameKey: 'vehicleBrandName' },
	{ idKey: 'vehicleSubBrandId', nameKey: 'vehicleSubBrandName' },
	{ idKey: 'vehicleSeriesId', nameKey: 'vehicleSeriesName' },
	{ idKey: 'vehicleShapeId', nameKey: 'vehicleShapeName' }
]

function buildDisplayText(carInfo = {}) {
	const parts = [
		carInfo.vehicleBrandName,
		carInfo.vehicleSubBrandName,
		carInfo.vehicleSeriesName,
		carInfo.vehicleShapeName
	].filter(part => part != null && part !== '')
	return parts.join('/')
}

function cascadeLevelsToCarInfo(levels = []) {
	if (!Array.isArray(levels) || !levels.length) {
		return null
	}
	const next = {}
	CASCADE_LEVEL_SPECS.forEach(({ idKey, nameKey }, index) => {
		const level = levels[index]
		if (!level) return
		const id = level.id ?? level.value
		const name = level.name ?? level.label
		if (id != null && id !== '') {
			next[idKey] = String(id)
		}
		if (name != null && name !== '') {
			next[nameKey] = String(name)
		}
	})
	if (!Object.keys(next).length) {
		return null
	}
	next.displayText = buildDisplayText(next)
	return next
}

function normalizeCarBrandObject(obj = {}) {
	if (Array.isArray(obj)) {
		return cascadeLevelsToCarInfo(obj)
	}
	const next = {}
	CAR_BRAND_FIELD_KEYS.forEach(key => {
		if (obj[key] != null && obj[key] !== '') {
			next[key] = obj[key]
		}
	})
	if (obj.displayText) {
		next.displayText = obj.displayText
	} else {
		next.displayText = buildDisplayText(next)
	}
	return next
}

function normalizeCarBrandValue(raw) {
	if (raw == null || raw === '') {
		return null
	}
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw)
			if (parsed && typeof parsed === 'object') {
				return normalizeCarBrandObject(parsed)
			}
		} catch (error) {
			return { displayText: raw }
		}
		return { displayText: raw }
	}
	if (typeof raw === 'object') {
		return normalizeCarBrandObject(raw)
	}
	return null
}

function carInfoToCascadeLevels(carInfo = {}) {
	const normalized = normalizeCarBrandValue(carInfo)
	if (!normalized) return []
	return CASCADE_LEVEL_SPECS.map(({ idKey, nameKey }) => ({
		id: normalized[idKey] != null ? String(normalized[idKey]) : '',
		name: normalized[nameKey] != null ? String(normalized[nameKey]) : ''
	})).filter(level => level.id !== '' || level.name !== '')
}

function isSubform(field = {}) {
	return field.type === 'subform'
}

function isStaticGroup(field = {}) {
	return field.type === 'group'
}

function getSubformRowTemplate(field = {}) {
	if (!isSubform(field)) {
		return []
	}
	const first = field.children?.[0]
	if (Array.isArray(first) && first.length) {
		return first
	}
	if (Array.isArray(field.origin_children) && field.origin_children.length) {
		return field.origin_children
	}
	return []
}

/** 增行 / cache 列模板：优先 origin_children */
function getSubformRowTemplateForAdd(field = {}) {
	if (!isSubform(field)) {
		return []
	}
	if (Array.isArray(field.origin_children) && field.origin_children.length) {
		return field.origin_children
	}
	return getSubformRowTemplate(field)
}

function clearRowFieldForAdd(field = {}) {
	const next = { ...field }
	delete next.value
	const key = next.key
	if (key != null && Object.prototype.hasOwnProperty.call(next, key)) {
		delete next[key]
	}
	return next
}

function isEmptyTemplateValue(value) {
	return value === undefined || value === null || value === ''
}

/** origin_children 列模板：清 select 双 key/选值，保留 numberInput 等模板 value（含 0） */
function sanitizeOriginChildrenField(field = {}) {
	const next = { ...field }
	const key = next.key
	if (key != null && Object.prototype.hasOwnProperty.call(next, key)) {
		delete next[key]
	}
	if (next.type === 'select' || next.type === 'multipleSelect') {
		delete next.value
	}
	return next
}

function sanitizeOriginChildrenColumn(list = []) {
	return cloneJson(list || []).map(sanitizeOriginChildrenField)
}

/** 回显时合并 saved origin_children 与 schema 模板，补回被历史保存剥离的模板默认值 */
function mergeOriginChildrenWithSchema(schemaOrigin = [], savedOrigin = []) {
	const schemaList = cloneJson(schemaOrigin || [])
	const savedList = cloneJson(savedOrigin || [])
	if (!schemaList.length) {
		return sanitizeOriginChildrenColumn(savedList)
	}
	if (!savedList.length) {
		return sanitizeOriginChildrenColumn(schemaList)
	}
	const savedByKey = new Map(savedList.filter(f => f?.key).map(f => [f.key, f]))
	return sanitizeOriginChildrenColumn(
		schemaList.map(schemaField => {
			const saved = savedByKey.get(schemaField.key)
			if (!saved) {
				return schemaField
			}
			const merged = { ...schemaField, ...saved }
			if (schemaField.value !== undefined && isEmptyTemplateValue(merged.value)) {
				merged.value = schemaField.value
			}
			return merged
		})
	)
}

function getStaticGroupChildren(field = {}) {
	if (!isStaticGroup(field)) {
		return []
	}
	const children = field.children
	return Array.isArray(children) ? children : []
}

function getRowTemplate(group = {}) {
	return getSubformRowTemplate(group)
}

function isRowFieldsList(value) {
	if (!Array.isArray(value) || !value.length) {
		return false
	}
	const first = value[0]
	return (
		Array.isArray(first) &&
		first.length > 0 &&
		first[0] &&
		typeof first[0] === 'object' &&
		first[0].key != null &&
		first[0].type != null
	)
}

function cloneRowFieldsList(rowFieldsList = []) {
	return cloneJson(rowFieldsList)
}

function rowFieldsToValueMap(rowFields = []) {
	const map = {}
	;(rowFields || []).forEach(field => {
		if (!field?.key) return
		const v = resolveAppRowFieldEngineValue(field)
		if (v === undefined || v === null || v === '') {
			return
		}
		if (Array.isArray(v) && v.length === 0) {
			return
		}
		map[field.key] = v
	})
	return map
}

function resolveOptionId(option = {}) {
	return option.id ?? option.value ?? ''
}

function resolveOptionName(option = {}) {
	return option.name ?? option.label ?? ''
}

function normalizeOptionRecord(option = {}) {
	if (!option || typeof option !== 'object') {
		return null
	}
	const id = resolveOptionId(option)
	const name = resolveOptionName(option)
	if (id === '' && name === '') {
		return null
	}
	const next = { id: String(id), name: String(name) }
	Object.keys(option).forEach(key => {
		if (key === 'label' || key === 'value') {
			return
		}
		if (option[key] != null && option[key] !== '') {
			next[key] = option[key]
		}
	})
	return next
}

function findStaticOption(field = {}, rawId) {
	const str = String(rawId)
	return (field.options || []).find(
		option => String(option.value) === str || String(option.id) === str
	)
}

function scalarToSelectObject(field = {}, rawValue) {
	const scalar = coerceSelectValue(rawValue)
	if (scalar === '' || scalar == null) {
		return undefined
	}
	const matched = findStaticOption(field, scalar)
	return {
		id: String(scalar),
		name: matched?.label ?? matched?.name ?? String(scalar)
	}
}

function isRemoteMultipleSelectField(field = {}) {
	return (
		field.type === 'multipleSelect' &&
		field.optionsKey &&
		REMOTE_SELECT_OPTIONS_KEYS.has(field.optionsKey)
	)
}

function isRemoteSelectField(field = {}) {
	return (
		field.type === 'select' &&
		field.optionsKey &&
		REMOTE_SELECT_OPTIONS_KEYS.has(field.optionsKey)
	)
}

/** jsonContent childrenValue：text=回显名，value=id 字符串 */
function resolveRemoteSelectTextAndId(field = {}) {
	const fk = field.key
	const meta = fk != null ? field[fk] : undefined
	const fallbackLabel =
		typeof field.value === 'string' && field.value !== '' ? field.value : ''
	const { id, label } = extractSelectIdAndLabel(meta ?? field.value, fallbackLabel)
	if (id == null || id === '') {
		return null
	}
	let text = ''
	if (
		typeof field.value === 'string' &&
		field.value !== '' &&
		String(field.value) !== String(id)
	) {
		text = field.value
	} else if (label) {
		text = label
	} else if (typeof field.value === 'string') {
		text = field.value
	}
	return { text, value: String(id) }
}

/** 从引擎值提取 multipleSelect 双 key：id 数组 + / 拼接展示名 */
function extractMultipleSelectIdsAndLabels(raw, field = {}) {
	const coerced = coerceMultipleSelectValue(raw)
	if (!Array.isArray(coerced) || !coerced.length) {
		return { ids: [], displayLabel: '' }
	}
	const ids = []
	const names = []
	coerced.forEach(item => {
		if (isPlainObject(item)) {
			const id = resolveOptionId(item)
			const name = resolveOptionName(item)
			if (id !== '' || name !== '') {
				if (id !== '') {
					ids.push(String(id))
				}
				names.push(name || String(id))
			}
			return
		}
		const str = String(item)
		if (str === '') {
			return
		}
		ids.push(str)
		const matched = findStaticOption(field, str)
		names.push(matched?.label ?? matched?.name ?? str)
	})
	return { ids, displayLabel: names.filter(part => part != null && part !== '').join('/') }
}

/** App jsonContent 双 key：field[key] 为 id 数组时，用 value 的 / 展示串还原 { id, name } */
function splitMultipleSelectDisplayLabel(value) {
	if (typeof value !== 'string' || value === '') {
		return []
	}
	const trimmed = value.trim()
	if (trimmed.startsWith('[')) {
		return []
	}
	return trimmed.split('/').map(part => part.trim()).filter(part => part !== '')
}

function zipMultipleSelectIdsWithDisplayLabel(ids = [], displayLabel = '') {
	const names = splitMultipleSelectDisplayLabel(displayLabel)
	return ids.map((id, index) => ({
		id: String(id),
		name: names[index] != null && names[index] !== '' ? names[index] : String(id)
	}))
}

function resolveMultipleSelectEngineValueFromAppField(field = {}) {
	const key = field.key
	const meta = key != null ? field[key] : undefined

	if (Array.isArray(meta)) {
		if (!meta.length) {
			return []
		}
		if (meta.some(item => typeof item === 'object')) {
			return coerceMultipleSelectValue(meta)
		}
		const displayNames = splitMultipleSelectDisplayLabel(field.value)
		if (displayNames.length) {
			return zipMultipleSelectIdsWithDisplayLabel(meta, field.value)
		}
		return meta.map(id => String(id))
	}

	const v = field.value
	if (Array.isArray(v)) {
		const coerced = coerceMultipleSelectValue(v)
		if (!coerced.length) {
			return []
		}
		if (coerced.some(item => typeof item === 'object')) {
			return coerced
		}
		return coerced.map(item => String(item))
	}

	if (typeof v === 'string' && v !== '') {
		const trimmed = v.trim()
		if (trimmed.startsWith('[')) {
			return coerceMultipleSelectValue(v)
		}
		return []
	}

	const coerced = coerceMultipleSelectValue(v)
	if (Array.isArray(coerced)) {
		return coerced
	}
	return coerced == null || coerced === '' ? [] : coerced
}

function extractSelectStorageValueFromRowField(field = {}) {
	if (field.type !== 'select') {
		return undefined
	}
	const key = field.key
	const meta = key != null ? field[key] : undefined

	if (field.optionsKey) {
		if (isPlainObject(meta)) {
			return normalizeOptionRecord(meta) || undefined
		}
		const v = field.value
		if (isPlainObject(v)) {
			return normalizeOptionRecord(v) || undefined
		}
		const scalar = meta != null && meta !== '' ? meta : v
		if (scalar === undefined || scalar === null || scalar === '') {
			return undefined
		}
		const obj = scalarToSelectObject(field, scalar)
		if (
			obj &&
			typeof v === 'string' &&
			v !== '' &&
			String(v) !== String(scalar) &&
			(!obj.name || obj.name === String(scalar))
		) {
			obj.name = v
		}
		return obj
	}

	const v = field.value
	if (v === undefined || v === null || v === '') {
		return undefined
	}
	if (isPlainObject(v)) {
		return v
	}
	return scalarToSelectObject(field, v)
}

function rowFieldsToStorageValueMap(rowFields = []) {
	const map = {}
	;(rowFields || []).forEach(field => {
		if (!field?.key) return
		if (field.type === 'select') {
			const storageValue = extractSelectStorageValueFromRowField(field)
			if (storageValue !== undefined && storageValue !== null && storageValue !== '') {
				map[field.key] = storageValue
			}
			return
		}
		Object.assign(map, rowFieldsToValueMap([field]))
	})
	return map
}

function rowsToStorageValueMaps(rowFieldsList = []) {
	return (rowFieldsList || []).map(rowFieldsToStorageValueMap)
}

function buildSelectSubmitValue(field = {}, rawValue) {
	if (rawValue == null || rawValue === '') {
		return undefined
	}
	if (isPlainObject(rawValue)) {
		const normalized = normalizeOptionRecord(rawValue)
		return normalized || undefined
	}
	return scalarToSelectObject(field, rawValue)
}

function itemToSelectObject(field = {}, item) {
	if (isPlainObject(item)) {
		return normalizeOptionRecord(item)
	}
	return scalarToSelectObject(field, item)
}

function buildMultipleSelectSubmitValue(field = {}, rawValue) {
	const coerced = coerceMultipleSelectValue(rawValue)
	if (coerced == null || coerced === '') {
		return undefined
	}
	if (!Array.isArray(coerced)) {
		return undefined
	}
	const items = coerced.map(item => itemToSelectObject(field, item)).filter(Boolean)
	return items.length ? items : undefined
}

function buildCarBrandSubmitValue(rawValue) {
	const normalized = normalizeCarBrandValue(rawValue)
	if (!normalized) {
		return undefined
	}
	const levels = carInfoToCascadeLevels(normalized)
	return levels.length ? levels : undefined
}

function getGroupRows(values = {}, groupKey = '') {
	const rows = values[groupKey]
	if (!Array.isArray(rows)) {
		return []
	}
	return rows.map(row => (row && typeof row === 'object' ? { ...row } : {}))
}

function pushFieldDataItem(items, item) {
	items.push(item)
}

/** schema 字段类型映射为后端存储类型（INT/DECIMAL/STRING/JSON 等） */
export function mapSchemaFieldToStorageType(field = {}) {
	const type = field.type
	if (type === 'numberInput') {
		if (field.rules?.decimal) return 'DECIMAL'
		return 'INT'
	}
	if (type === 'radio' || type === 'textarea' || type === 'select' || type === 'text') {
		return 'STRING'
	}
	if (type === 'carBrandSelect') return 'JSON'
	if (type === 'switch' || type === 'checkbox') return 'BOOL'
	if (type === 'date') return 'DATE'
	if (type === 'datetime') return 'DATETIME'
	return 'STRING'
}

/** 按 storageType 序列化字段值为字符串 */
export function serializeFieldValueForStorage(value, storageType = 'STRING') {
	if (value === undefined || value === null || value === '') {
		return ''
	}
	if (storageType === 'JSON' || typeof value === 'object') {
		return JSON.stringify(value)
	}
	return String(value)
}

function resolveStorageFieldValue(field = {}, fieldValue) {
	if (field.type === 'select') {
		const value = buildSelectSubmitValue(field, fieldValue)
		if (value === undefined || value == null || value === '') {
			return { value: undefined, storageType: 'JSON' }
		}
		return { value, storageType: 'JSON' }
	}
	if (field.type === 'multipleSelect') {
		const value = buildMultipleSelectSubmitValue(field, fieldValue)
		if (value === undefined || value == null || (Array.isArray(value) && !value.length)) {
			return { value: undefined, storageType: 'JSON' }
		}
		return { value, storageType: 'JSON' }
	}
	if (field.type === 'carBrandSelect') {
		const value = buildCarBrandSubmitValue(fieldValue)
		if (value === undefined || value == null || (Array.isArray(value) && !value.length)) {
			return { value: undefined, storageType: 'JSON' }
		}
		return { value, storageType: 'JSON' }
	}
	if (typeof fieldValue === 'object' && fieldValue !== null) {
		return { value: fieldValue, storageType: 'JSON' }
	}
	return { value: fieldValue, storageType: mapSchemaFieldToStorageType(field) }
}

function buildNormalizedFieldDataEntry({
	field,
	fieldKey,
	displayName,
	fieldValue,
	groupKey,
	rowIndex
}) {
	const { value: normalizedValue, storageType } = resolveStorageFieldValue(field, fieldValue)
	if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
		return null
	}
	const serialized = serializeFieldValueForStorage(normalizedValue, storageType)
	if (serialized === '') return null
	const entry = {
		fieldKey,
		displayName,
		fieldName: displayName,
		fieldType: storageType,
		fieldValue: serialized
	}
	if (groupKey != null) entry.groupKey = groupKey
	if (rowIndex != null) entry.rowIndex = rowIndex
	return entry
}

function appendNormalizedSubformFieldDataList(items, visibleList = [], values = {}) {
	;(visibleList || []).forEach(field => {
		if (field.type !== 'subform') {
			return
		}
		const rows = getGroupRows(values, field.key)
		const children = getSubformRowTemplate(field)
		rows.forEach((row, rowIndex) => {
			children.forEach(child => {
				const fieldValue = row[child.key]
				if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
					return
				}
				const entry = buildNormalizedFieldDataEntry({
					field: child,
					fieldKey: child.key,
					displayName: child.label,
					fieldValue,
					groupKey: field.key,
					rowIndex
				})
				if (entry) pushFieldDataItem(items, entry)
			})
		})
	})
}

function hasSubformRowFieldDataListItems(items, groupKey) {
	return (items || []).some(item => item?.groupKey === groupKey)
}

/** 无行数据时写入 subform 区块占位（与 jsonContent 空 childrenValue 对齐） */
function appendSubformSectionFieldDataList(items, visibleList = []) {
	;(visibleList || []).forEach(field => {
		if (field.type !== 'subform' || !field.key) {
			return
		}
		if (hasSubformRowFieldDataListItems(items, field.key)) {
			return
		}
		const displayName = field.label || field.key
		pushFieldDataItem(items, {
			fieldKey: field.key,
			displayName,
			fieldName: displayName,
			fieldType: 'subform',
			fieldValue: '[]'
		})
	})
}

function buildNormalizedSubformDataEntry({ parentField, rowIndex, child, fieldValue }) {
	if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
		return null
	}
	const { value: normalizedValue, storageType } = resolveStorageFieldValue(child, fieldValue)
	if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
		return null
	}
	const serialized = serializeFieldValueForStorage(normalizedValue, storageType)
	if (serialized === '') return null
	return {
		parentFieldKey: parentField.key,
		parentFieldName: parentField.label,
		rowIndex,
		columnFieldKey: child.key,
		columnFieldName: child.label,
		fieldType: storageType,
		fieldValue: serialized
	}
}

/** 构建规范化 fieldDataList（固定字段 + subform 行字段） */
export function buildNormalizedFieldDataList(visibleList = [], values = {}) {
	const items = []
	;(visibleList || []).forEach(field => {
		if (field.type === 'subform') {
			return
		}
		if (field.type === 'group') {
			getStaticGroupChildren(field).forEach(child => {
				const fieldValue = values[child.key]
				if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
					return
				}
				const entry = buildNormalizedFieldDataEntry({
					field: child,
					fieldKey: child.key,
					displayName: child.label,
					fieldValue
				})
				if (entry) pushFieldDataItem(items, entry)
			})
			return
		}
		if (field.type === 'divider') {
			return
		}
		const fieldValue = values[field.key]
		if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
			return
		}
		const entry = buildNormalizedFieldDataEntry({
			field,
			fieldKey: field.key,
			displayName: field.label,
			fieldValue
		})
		if (entry) pushFieldDataItem(items, entry)
	})
	if (FIELD_DATA_LIST_INCLUDE_SUBFORM_ROWS) {
		appendNormalizedSubformFieldDataList(items, visibleList, values)
	}
	if (FIELD_DATA_LIST_INCLUDE_SUBFORM_SECTIONS) {
		appendSubformSectionFieldDataList(items, visibleList)
	}
	return items
}

/** 构建规范化 subformDataList（subform 行内字段） */
export function buildNormalizedSubformDataList(visibleList = [], values = {}) {
	const items = []
	;(visibleList || []).forEach(field => {
		if (field.type !== 'subform') {
			return
		}
		const rows = getGroupRows(values, field.key)
		const children = getSubformRowTemplate(field)
		rows.forEach((row, rowIndex) => {
			children.forEach(child => {
				const fieldValue = row[child.key]
				const entry = buildNormalizedSubformDataEntry({
					parentField: field,
					rowIndex,
					child,
					fieldValue
				})
				if (entry) pushFieldDataItem(items, entry)
			})
		})
	})
	return items
}

// --- 公开 API ---

/** detail.get jsonContent → 标准 formList 数组（兼容 string / array / { list: [] }） */
export function normalizeJsonContentList(jsonContent) {
	if (jsonContent == null || jsonContent === '') {
		return []
	}
	try {
		const parsed =
			typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent
		if (Array.isArray(parsed)) {
			return parsed
		}
		if (parsed && typeof parsed === 'object' && Array.isArray(parsed.list)) {
			return parsed.list
		}
	} catch (error) {
		console.error('normalizeJsonContentList error', error)
	}
	return []
}

/**
 * 详情 jsonContent 中需强制回显的区块 key（subform / group）
 * 用于回显时绕过 brandId、filterBrandId、baseSceneCode
 */
export function getEchoSubformKeysFromJsonContent(jsonContent) {
	return normalizeJsonContentList(jsonContent)
		.filter(
			item =>
				item?.key && (item.type === 'subform' || item.type === 'group')
		)
		.map(item => item.key)
}

/**
 * jsonContent 非空时标记详情回显 scope，供 visibility 跳过新建日模板过滤
 * @param {Object} pageContext
 * @param {Object} [detail={}]
 * @returns {Object} pageContext
 */
export function enrichPageContextWithDetailEcho(pageContext, detail = {}) {
	const list = normalizeJsonContentList(detail.jsonContent)
	if (!list.length) {
		return pageContext
	}
	pageContext.hasDetailEcho = true
	const subformKeys = list
		.filter(
			item =>
				item?.key && (item.type === 'subform' || item.type === 'group')
		)
		.map(item => item.key)
	if (subformKeys.length) {
		pageContext.echoSubformKeys = subformKeys
	}
	pageContext.echoTopLevelKeys = list.filter(item => item?.key).map(item => item.key)
	return pageContext
}

export const REMOTE_SELECT_OPTIONS_KEYS = new Set(['4sStaffList', 'storeStaffList', 'orderList'])

/** 从标量或 { id, name, ... } 提取 App select 的 id 与展示名 */
export function extractSelectIdAndLabel(raw, fallbackLabel = '') {
	if (raw == null || raw === '') {
		return { id: undefined, label: '' }
	}
	if (isPlainObject(raw)) {
		const id = raw.id ?? raw.value
		const label = raw.name ?? raw.label ?? fallbackLabel
		return {
			id: id == null || id === '' ? undefined : String(id),
			label: label == null ? '' : String(label)
		}
	}
	const id = coerceSelectValue(raw)
	return {
		id: id === '' || id == null ? undefined : String(id),
		label: fallbackLabel || String(id)
	}
}

/** App 车型展示串：品牌-子品牌-车系-款型 */
export function buildAppCarBrandDisplayString(carInfo = {}) {
	const normalized = normalizeCarBrandValue(carInfo)
	if (!normalized) return ''
	const parts = [
		normalized.vehicleBrandName,
		normalized.vehicleSubBrandName,
		normalized.vehicleSeriesName,
		normalized.vehicleShapeName
	].filter(part => part != null && part !== '')
	if (parts.length) {
		return parts.join('-')
	}
	return normalized.displayText || ''
}

/** 从 App 形态 FormField 解析引擎 valueMap 用的值 */
export function resolveAppRowFieldEngineValue(field = {}) {
	if (!field?.key) return undefined

	if (field.type === 'carBrandSelect') {
		const meta = field[field.key]
		if (meta && typeof meta === 'object') {
			return normalizeCarBrandValue(meta)
		}
		return normalizeCarBrandValue(field.value)
	}

	if (field.type === 'select' && field.optionsKey) {
		const meta = field[field.key]
		if (meta != null && meta !== '') {
			if (isPlainObject(meta)) {
				return extractSelectIdAndLabel(meta, field.value).id ?? meta
			}
			return meta
		}
		return coerceSelectValue(field.value)
	}

	if (field.type === 'select') {
		return coerceSelectValue(field.value)
	}

	if (isRemoteMultipleSelectField(field)) {
		return resolveMultipleSelectEngineValueFromAppField(field)
	}

	return field.value
}

/** FormField[] → 行 valueMap（App 双 key 优先） */
export function appRowFieldsToValueMap(rowFields = []) {
	const map = {}
	;(rowFields || []).forEach(field => {
		if (!field?.key) return
		const v = resolveAppRowFieldEngineValue(field)
		if (v === undefined || v === null || v === '') {
			return
		}
		if (Array.isArray(v) && v.length === 0) {
			return
		}
		map[field.key] = v
	})
	return map
}

/** 单行 FormField[] → gl_tape childrenValue 行包 { [groupKey]: { [fieldKey]: value } } */
export function rowFieldsToChildrenValueRow(groupKey, rowFields = []) {
	const rowBag = { [groupKey]: {} }
	;(rowFields || []).forEach(field => {
		if (!field?.key) {
			return
		}
		const fk = field.key
		if (isRemoteSelectField(field)) {
			const pair = resolveRemoteSelectTextAndId(field)
			if (pair) {
				rowBag[groupKey][fk] = pair
			}
			return
		}
		const text = field.value ?? ''
		const meta = field[fk]
		if (meta != null && meta !== '') {
			rowBag[groupKey][fk] = { text, value: meta }
		} else {
			rowBag[groupKey][fk] = text
		}
	})
	return rowBag
}

/** subform.children（FormField[][]）→ childrenValue[] */
export function childrenToChildrenValue(section = {}) {
	const groupKey = section.key
	if (!groupKey) {
		return []
	}
	const rowFieldsList = isRowFieldsList(section.children) ? section.children : []
	return rowFieldsList.map(row => rowFieldsToChildrenValueRow(groupKey, row))
}

/** childrenValue + origin_children → FormField[][]（对齐 gl_tape index.vue 回显） */
export function childrenValueToRowFieldsList(section = {}) {
	const groupKey = section.key
	const childrenValue = section.childrenValue
	if (!groupKey || !Array.isArray(childrenValue) || !childrenValue.length) {
		return []
	}
	const templateSource =
		Array.isArray(section.origin_children) && section.origin_children.length
			? section.origin_children
			: getSubformRowTemplate(section)
	if (!templateSource.length) {
		return []
	}
	return childrenValue.map(rowBag => {
		const row = cloneJson(templateSource)
		row.forEach(item => {
			const fk = item.key
			const val = rowBag[groupKey]?.[fk]
			if (val === undefined || val === null) {
				return
			}
			if (typeof val === 'string') {
				item.value = val
			} else if (typeof val === 'object') {
				item.value = val.text
				if (val.value != null && val.value !== '') {
					item[fk] = isPlainObject(val.value)
						? extractSelectIdAndLabel(val.value, val.text).id ?? val.value
						: val.value
				}
			} else {
				item.value = val
			}
		})
		return row
	})
}

/** 读取 section 行数据（children / value，不含 childrenValue 解码） */
function resolveSectionRowFieldsListRaw(section = {}) {
	if (isRowFieldsList(section.children)) {
		return cloneJson(section.children)
	}
	if (isRowFieldsList(section.value)) {
		return cloneJson(section.value)
	}
	if (
		Array.isArray(section.children) &&
		section.children.length &&
		section.children[0] &&
		typeof section.children[0] === 'object' &&
		!Array.isArray(section.children[0])
	) {
		return cloneJson(section.children)
	}
	if (
		Array.isArray(section.value) &&
		section.value.length &&
		section.value[0] &&
		typeof section.value[0] === 'object' &&
		!Array.isArray(section.value[0])
	) {
		return cloneJson(section.value)
	}
	return []
}

/** subform 保存：children/value → childrenValue，删除 children */
export function serializeSubformSectionForJsonContent(section = {}) {
	const next = cloneJson(section)
	const rowFieldsList = resolveSectionRowFieldsListRaw(next)
	if (rowFieldsList.length && next.key) {
		next.childrenValue = childrenToChildrenValue({
			...next,
			children: rowFieldsList
		})
	} else if (!Array.isArray(next.childrenValue)) {
		next.childrenValue = []
	}
	if (next.type === 'subform') {
		delete next.children
		delete next.value
	}
	return next
}

/** formList 保存入库：subform 节点序列化为 childrenValue 形态 */
export function serializeFormListForAppJsonStorage(formList = []) {
	const jsonStorage = { jsonStorage: true }
	return (formList || []).map(field => {
		if (field.type === 'subform') {
			return serializeSubformSectionForJsonContent(field)
		}
		if (field.type === 'group') {
			const next = formatFieldForAppJsonContent(field, jsonStorage)
			const children = getStaticGroupChildren(next)
			if (children.length) {
				next.children = children.map(child => formatFieldForAppJsonContent(child, jsonStorage))
			}
			return next
		}
		return formatFieldForAppJsonContent(field, jsonStorage)
	})
}

/** 从 subform section 节点读取行 FormField[][]（childrenValue / children / value） */
export function getSectionRowFieldsList(section = {}) {
	if (Array.isArray(section.childrenValue) && section.childrenValue.length) {
		return childrenValueToRowFieldsList(section)
	}
	return resolveSectionRowFieldsListRaw(section)
}

/** valueMap[] 形态（非 FormField[][]） */
export function isValueMapList(list = []) {
	if (!Array.isArray(list) || !list.length) {
		return false
	}
	const first = list[0]
	return first && typeof first === 'object' && !Array.isArray(first) && first.key == null
}

/** 保存前：FormField 按 App 双 key 格式化；jsonStorage 时 field[key] 仅存 id 字符串（入库 jsonContent） */
export function formatFieldForAppJsonContent(field = {}, options = {}) {
	const next = cloneJson(field)
	const key = next.key
	const jsonStorage = options.jsonStorage === true

	if (next.type === 'carBrandSelect') {
		const raw = next[key] ?? next.value
		const carInfo = normalizeCarBrandValue(raw)
		if (!carInfo) {
			delete next.value
			delete next[key]
			return next
		}
		const meta = { ...carInfo }
		delete meta.displayText
		next.value = buildAppCarBrandDisplayString(carInfo)
		next[key] = meta
		return next
	}

	if (next.type === 'select' && next.optionsKey && REMOTE_SELECT_OPTIONS_KEYS.has(next.optionsKey)) {
		const rawMeta = next[key]
		const fallbackLabel =
			typeof next.value === 'string' && next.value !== '' ? next.value : ''
		const source = rawMeta ?? next.value
		const { id, label } = extractSelectIdAndLabel(source, fallbackLabel)
		if (id == null || id === '') {
			delete next.value
			delete next[key]
			return next
		}
		let metaObject
		if (isPlainObject(rawMeta)) {
			metaObject = normalizeOptionRecord(rawMeta) || { id: String(id), name: label || String(id) }
		} else if (isPlainObject(source)) {
			metaObject = normalizeOptionRecord(source) || { id: String(id), name: label || String(id) }
		} else {
			metaObject = { id: String(id), name: label || String(id) }
		}
		if (
			typeof next.value === 'string' &&
			next.value !== '' &&
			(!metaObject.name || metaObject.name === String(id))
		) {
			metaObject.name = next.value
		}
		next[key] = jsonStorage ? String(id) : metaObject
		if (label) {
			next.value = label
		} else if (next.value == null || next.value === '' || isPlainObject(next.value)) {
			next.value = metaObject.name || id
		}
		return next
	}

	if (isRemoteMultipleSelectField(next)) {
		const raw = next[key] ?? next.value
		let { ids, displayLabel } = extractMultipleSelectIdsAndLabels(raw, next)
		if (
			!displayLabel &&
			typeof next.value === 'string' &&
			next.value !== '' &&
			!next.value.trim().startsWith('[')
		) {
			displayLabel = next.value
		}
		if (!ids.length) {
			delete next.value
			delete next[key]
			return next
		}
		next[key] = ids
		next.value = displayLabel
		return next
	}

	return next
}

/** 将 jsonContent 中的 subform children 写入 schema.list[].value（FormField[][]） */
export function mergeAppJsonIntoSchema(schemaRoot = {}, detail = {}) {
	const nextSchema = cloneJson(schemaRoot)
	if (!detail?.jsonContent || !Array.isArray(nextSchema.list)) {
		return nextSchema
	}

	const parsed = normalizeJsonContentList(detail.jsonContent)
	if (!parsed.length) {
		return nextSchema
	}

	const sectionByKey = new Map(
		parsed.filter(item => item?.type === 'subform' && item.key).map(item => [item.key, item])
	)

	nextSchema.list = nextSchema.list.map(field => {
		if (field.type !== 'subform') {
			return field
		}
		const section = sectionByKey.get(field.key)
		if (!section) {
			return field
		}
		const nextField = { ...field }
		const rowFieldsList = getSectionRowFieldsList(section)

		if (Array.isArray(section.origin_children) && section.origin_children.length) {
			nextField.origin_children = mergeOriginChildrenWithSchema(
				field.origin_children || [],
				section.origin_children
			)
			if (!getRowTemplate(field).length) {
				nextField.children = [cloneJson(nextField.origin_children)]
			}
		}

		if (rowFieldsList.length) {
			nextField.value = rowFieldsList
		}

		return nextField
	})

	return nextSchema
}

function evalShowRulePart(part = '', ctx = {}) {
	const trimmed = part.trim()
	const eqMatch = trimmed.match(/^val(\d+)\s*==\s*(?:'([^']*)'|"([^"]*)")$/)
	if (eqMatch) {
		const actual = ctx[`val${eqMatch[1]}`]
		const expected = eqMatch[2] != null ? eqMatch[2] : eqMatch[3]
		return actual == expected
	}
	const neNullMatch = trimmed.match(/^val(\d+)\s*!=\s*null$/)
	if (neNullMatch) {
		const actual = ctx[`val${neNullMatch[1]}`]
		return actual != null && actual !== ''
	}
	return false
}

function evaluateShowRuleForJson(keys = [], resultExpr = '', rowFields = [], getRowFieldValue) {
	if (!keys.length || !resultExpr) {
		return true
	}
	try {
		const ctx = {}
		keys.forEach((key, index) => {
			ctx[`val${index + 1}`] = getRowFieldValue(rowFields, key)
		})
		return resultExpr.split('&&').every(part => evalShowRulePart(part, ctx))
	} catch (error) {
		return false
	}
}

function getRowFieldValueForShowRule(rowFields = [], key = '', rowMap = null) {
	const field = (rowFields || []).find(item => item.key === key)
	if (field) {
		if (field.value != null && field.value !== '') {
			return field.value
		}
		const metaKey = field.key
		if (metaKey != null && field[metaKey] != null && field[metaKey] !== '') {
			const meta = field[metaKey]
			if (typeof meta === 'object' && !Array.isArray(meta)) {
				return meta.name ?? meta.label ?? meta.id ?? meta
			}
			return meta
		}
	}
	if (rowMap && rowMap[key] != null && rowMap[key] !== '') {
		return rowMap[key]
	}
	return null
}

function isGroupChildVisibleInRowForJson(group = {}, child = {}, rowFields = [], rowMap = null) {
	const rules = group.childrenShowRules
	if (!rules || !child?.key) {
		return true
	}
	const rule = rules[child.key]
	if (!rule) {
		return true
	}
	const keys = rule.keys || []
	const resultExpr = rule.result
	if (!keys.length || !resultExpr) {
		return true
	}
	return evaluateShowRuleForJson(keys, resultExpr, rowFields, (rf, k) =>
		getRowFieldValueForShowRule(rf, k, rowMap)
	)
}

function filterVisibleRowFieldsForJson(group = {}, rowFields = [], rowMap = null) {
	return (rowFields || []).filter(field =>
		isGroupChildVisibleInRowForJson(group, field, rowFields, rowMap)
	)
}

/** 从 engine 组装 App 形态 jsonContent（subform.children） */
export function buildAppJsonContent(visibleList = [], groupRowsCache = {}) {
	const sections = []

	;(visibleList || []).forEach(field => {
		if (field.type !== 'subform') {
			return
		}

		const rowFieldsList = groupRowsCache[field.key] || []
		const section = cloneJson(field)
		delete section.value

		const children = cloneRowFieldsList(rowFieldsList).map(row => {
			const rowMap = rowFieldsToStorageValueMap(row)
			const visibleRow = filterVisibleRowFieldsForJson(field, row, rowMap)
			return visibleRow.map(cell => formatFieldForAppJsonContent(cell))
		})

		section.children = children
		if (Array.isArray(field.origin_children) && field.origin_children.length) {
			section.origin_children = sanitizeOriginChildrenColumn(field.origin_children)
		} else {
			const columnTemplate = getSubformRowTemplateForAdd(field)
			if (columnTemplate.length) {
				section.origin_children = sanitizeOriginChildrenColumn(columnTemplate)
			}
		}

		sections.push(section)
	})

	return sections
}

/** 从 App jsonContent 解析 formList 与 fieldDataList/subformDataList 用的 values */
export function extractStorageValuesFromJsonContent(jsonContent) {
	const formList = normalizeJsonContentList(jsonContent)
	const values = {}

	;(formList || []).forEach(field => {
		if (field.type === 'subform') {
			const rowFieldsList = getSectionRowFieldsList(field)
			if (rowFieldsList.length) {
				values[field.key] = rowsToStorageValueMaps(rowFieldsList)
			}
			return
		}
		if (field.type === 'group') {
			getStaticGroupChildren(field).forEach(child => {
				const v = child.value
				if (v !== undefined && v !== null && v !== '') {
					values[child.key] = v
				}
			})
			return
		}
		if (field.type === 'divider') {
			return
		}
		const v = resolveAppRowFieldEngineValue(field)
		if (v !== undefined && v !== null && v !== '') {
			values[field.key] = v
		}
	})

	return { formList, values }
}

/** 一次返回 fieldDataList + subformDataList（App 最简入口，只传 jsonContent） */
export function buildAppNormalizedListsFromJsonContent(jsonContent) {
	const { formList, values } = extractStorageValuesFromJsonContent(jsonContent)
	return {
		fieldDataList: buildNormalizedFieldDataList(formList, values),
		subformDataList: buildNormalizedSubformDataList(formList, values)
	}
}

/**
 * 对齐 gl_tape mixins.submitReport 顺序（App subform.js 只读对照，不回写 App）：
 * 1) 仍含 children 的 formList → buildAppNormalizedListsFromJsonContent(JSON.stringify(list))
 * 2) 同一 list → serializeFormListForAppJsonStorage → jsonContent（childrenValue）
 */
export function buildAppDailyReportSubmitPayload(formListWithChildren = []) {
	const list = cloneJson(formListWithChildren)
	const { fieldDataList, subformDataList } = buildAppNormalizedListsFromJsonContent(
		JSON.stringify(list)
	)
	const jsonContent = JSON.stringify(serializeFormListForAppJsonStorage(list))
	return { jsonContent, fieldDataList, subformDataList }
}

/** 仅构建 fieldDataList */
export function buildAppFieldDataListFromJsonContent(jsonContent) {
	const { formList, values } = extractStorageValuesFromJsonContent(jsonContent)
	return buildNormalizedFieldDataList(formList, values)
}

/** 仅构建 subformDataList */
export function buildAppSubformDataListFromJsonContent(jsonContent) {
	const { formList, values } = extractStorageValuesFromJsonContent(jsonContent)
	return buildNormalizedSubformDataList(formList, values)
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		REMOTE_SELECT_OPTIONS_KEYS,
		extractSelectIdAndLabel,
		buildAppCarBrandDisplayString,
		resolveAppRowFieldEngineValue,
		appRowFieldsToValueMap,
		getSectionRowFieldsList,
		rowFieldsToChildrenValueRow,
		childrenToChildrenValue,
		childrenValueToRowFieldsList,
		serializeSubformSectionForJsonContent,
		serializeFormListForAppJsonStorage,
		isValueMapList,
		normalizeJsonContentList,
		getEchoSubformKeysFromJsonContent,
		enrichPageContextWithDetailEcho,
		formatFieldForAppJsonContent,
		mergeAppJsonIntoSchema,
		buildAppJsonContent,
		mapSchemaFieldToStorageType,
		serializeFieldValueForStorage,
		buildNormalizedFieldDataList,
		buildNormalizedSubformDataList,
		extractStorageValuesFromJsonContent,
		buildAppNormalizedListsFromJsonContent,
		buildAppDailyReportSubmitPayload,
		buildAppFieldDataListFromJsonContent,
		buildAppSubformDataListFromJsonContent,
		default: {
			buildAppJsonContent,
			mergeAppJsonIntoSchema,
			formatFieldForAppJsonContent,
			buildAppCarBrandDisplayString,
			extractSelectIdAndLabel,
			buildAppNormalizedListsFromJsonContent,
			buildAppDailyReportSubmitPayload,
			buildAppFieldDataListFromJsonContent,
			buildAppSubformDataListFromJsonContent,
			buildNormalizedFieldDataList,
			buildNormalizedSubformDataList
		}
	}
}
