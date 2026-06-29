<template>
  <view class="details-page" v-if="detailsInfo">
    <view class="nav-bar">
      <view class="back" @click.stop="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">评估单详情</view>
    </view>
    <view class="flex justify-between align-center mb-24 px-48">
      <view class="flex align-center justify-between">
        <view :class="['status mr-24', statusClass(detailsInfo.basic.status)]">{{ statusMap[detailsInfo.basic.status].name }}</view>
        <view class="status-box">
          <text class="label">工单编号</text>
          <text class="value ml-12">{{ detailsInfo.basic.evalOrderNo || '-' }}</text>
        </view>
      </view>
      <view class="status-box">
        <text class="label">工单时间</text>
        <text class="value ml-12">{{ detailsInfo.basic.createdDate || '-' }}</text>
      </view>
    </view>
    <view class="detail-content">
      <view class="box-class mt-16">
        <view class="tab-container">
          <scroll-view scroll-x enable-flex class="tab-scroll">
            <template v-for="(tab, index) in tabs">
              <view v-if="!tab.hidden" :key="tab.key" :class="['tab-item', { active: activeTabKey === tab.key }]" @click.stop="switchTabByKey(tab.key)">
                {{ tab.name }}
              </view>
            </template>
          </scroll-view>
        </view>
        <view class="tab-panel-container">
          <view class="tab-panel" :class="{ 'no-bac': activeTabKey != 'carLicense' && activeTabKey != 'carInfo' }">
            <!-- 动态标题 -->
            <view class="tab-panel-title" v-if="activeTabKey == 'carInfo' || activeTabKey == 'carLicense'">{{ tabs.find(tab => tab.key === activeTabKey) ? tabs.find(tab => tab.key === activeTabKey).name : '' }}</view>
            <!-- 动态内容区域 -->
            <view v-if="activeTabKey == 'carInfo'" class="gridBox">
              <view v-for="(item, index) in carInfoItems" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }]">
                <view class="title-label-see mr-16">{{ item.label }}</view>
                <view class="flex-1 break-word">
                  {{ formatValue(item, detailsInfo) }}
                  <text v-if="item.cell">{{ item.cell }}</text>
                </view>
              </view>
            </view>
            <view v-else-if="activeTabKey == 'carLicense'" class="gridBox mb-32">
              <view v-for="(item, index) in carLicenseItems" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }]">
                <view class="title-label-see mr-16">{{ item.label }}</view>
                <view class="flex-1 break-word">{{ formatValue(item, detailsInfo) }}</view>
              </view>
            </view>
            <view v-else-if="activeTabKey == 'images'">
              <view class="upload-box mb-32">
                <view class="tab-panel-title">车辆图片</view>
                <view class="upload-grid">
                  <!-- 车辆外观图片 -->
                  <template v-for="field in uploadFields">
                    <view v-if="getImageBySubtype(field.key)" class="flex upload-item-container" :key="field.key">
                      <view class="upload-label">
                        {{ field.label }}
                      </view>
                      <view class="upload-images-wrapper" v-if="getImageBySubtype(field.key)">
                        <view class="uploaded-media-container">
                          <image :src="getImageDisplayUrl(getImageBySubtype(field.key).fileUrl)" mode="aspectFill" class="uploaded-media" @click.stop="previewMedia(getImageBySubtype(field.key).fileUrl, 1)"></image>
                        </view>
                      </view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="upload-box mb-32" v-if="hasCertificateImage">
                <view class="tab-panel-title">证件资料</view>
                <view class="upload-grid" :class="{ 'two-columns': shouldShowTwoColumns }">
                  <template v-for="field in uploadCertificateFields">
                    <view class="flex upload-item-container" :class="{ 'two-thirds': field.key === 22 && getImageBySubtype(field.key) && Array.isArray(getImageBySubtype(field.key)) && getImageBySubtype(field.key).length > 1 && !shouldShowTwoColumns }" :key="field.key" v-if="hasImageForField(field.key)">
                      <view class="upload-label">
                        {{ field.label }}
                      </view>
                      <view class="upload-images-wrapper">
                        <template v-if="field.key === 22 && Array.isArray(getImageBySubtype(field.key)) && getImageBySubtype(field.key).length > 0">
                          <view class="uploaded-media-container" v-for="(img, index) in getImageBySubtype(field.key)" :key="index">
                            <image :src="getImageDisplayUrl(img.fileUrl)" @click.stop="previewMedia(img.fileUrl, 1)" mode="aspectFill" class="uploaded-media"></image>
                          </view>
                        </template>
                        <!-- 对于其他类型的图片，保持原有显示方式 -->
                        <template v-else-if="!Array.isArray(getImageBySubtype(field.key)) && getImageBySubtype(field.key) && getImageBySubtype(field.key).fileUrl">
                          <view class="uploaded-media-container">
                            <image :src="getImageDisplayUrl(getImageBySubtype(field.key).fileUrl)" @click.stop="previewMedia(getImageBySubtype(field.key).fileUrl, 1)" mode="aspectFill" class="uploaded-media"></image>
                          </view>
                        </template>
                      </view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="upload-box mb-32" v-if="hasAnyVideo">
                <view class="tab-panel-title">车辆视频</view>
                <view class="upload-grid">
                  <view class="flex upload-item-container" v-for="field in uploadVideoFields" :key="field.key">
                    <view class="upload-label" v-if="getImageBySubtype(field.key)">
                      {{ field.label }}
                    </view>
                    <view class="upload-images-wrapper" v-if="getImageBySubtype(field.key)">
                      <view class="uploaded-media-container">
                        <view class="video-container">
                          <image :src="getVideoThumbnail(getImageBySubtype(field.key).fileUrl)" mode="aspectFill" class="uploaded-media" @click.stop="previewMedia(getImageBySubtype(field.key).fileUrl, 2)"></image>
                          <!-- <video :src="getImageBySubtype(field.key).fileUrl" mode="aspectFill" controls class="uploaded-media"></video> -->
                          <view class="video-play-icon">
                            <view class="sprite-icon icon-upload-play"></view>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view class="upload-box mb-32" v-if="hasAnyReportImage">
                <view class="tab-panel-title">车辆检测报告</view>
                <view class="upload-grid">
                  <view class="flex upload-item-container fullwidth" v-for="field in uploadReportFields" :key="field.key">
                    <view class="upload-label" v-if="getImageBySubtype(field.key)">
                      {{ field.label }}
                    </view>
                    <view class="upload-images-wrapper" v-if="getImageBySubtype(field.key)">
                      <template>
                        <view class="uploaded-media-container" v-for="(img, index) in getImageBySubtype(field.key)" :key="index">
                          <image :src="getImageDisplayUrl(img.fileUrl)" @click.stop="previewMedia(img.fileUrl, 1)" mode="aspectFill" class="uploaded-media"></image>
                        </view>
                      </template>
                    </view>
                  </view>
                </view>
              </view>
              <view class="upload-box mb-32" v-if="hasAnyOtherImage">
                <view class="tab-panel-title">其他图片</view>
                <view class="upload-grid">
                  <view class="flex upload-item-container fullwidth" v-for="field in uploadOtherFields" :key="field.key">
                    <view class="upload-label" v-if="getImageBySubtype(field.key)">
                      {{ field.label }}
                    </view>
                    <view class="upload-images-wrapper" v-if="getImageBySubtype(field.key)">
                      <template v-if="field.key === 41 && Array.isArray(getImageBySubtype(field.key))">
                        <view class="uploaded-media-container" v-for="(img, index) in getImageBySubtype(field.key)" :key="index">
                          <image :src="getImageDisplayUrl(img.fileUrl)" @click.stop="previewMedia(img.fileUrl, 1)" mode="aspectFill" class="uploaded-media"></image>
                        </view>
                      </template>
                      <!-- 对于其他类型的图片，保持原有显示方式 -->
                      <template v-else-if="!Array.isArray(getImageBySubtype(field.key))">
                        <view class="uploaded-media-container">
                          <image :src="getImageDisplayUrl(getImageBySubtype(field.key).fileUrl)" @click.stop="previewMedia(getImageBySubtype(field.key).fileUrl, 1)" mode="aspectFill" class="uploaded-media"></image>
                        </view>
                      </template>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else-if="activeTabKey == 'evaluation'">
              <!-- priceHistory 字段废弃：按轮展示 priceHistoryByRound，每轮内展示多次报价 -->
              <StepperNavigation :currentStep="currentStep" :steps="detailsInfo.priceHistoryByRound" direction="vertical">
                <template v-slot="{ step }">
                  <view class="gridBox mb-48 padBox">
                    <!-- 多次评估师报价（opType 10）：评估价1/2/3…，每条用 priceItems -->
                    <view v-for="(h, hIndex) in getRoundQuotes(step)" :key="`quote_block_${hIndex}`">
                      <view
                        v-for="(item, index) in priceItems"
                        :key="`quote_${hIndex}_${index}`"
                        :class="['flex align-center', { 'full-width': item.fullWidth }]"
                      >
                        <view class="title-label-see mr-16">
                          {{ item.label }}<text v-if="getRoundQuotes(step).length > 1">{{ hIndex + 1 }}</text>
                        </view>
                        <view class="flex-1 break-word">{{ h[item.key] || '-' }} {{ item.cell || '' }}</view>
                      </view>
                    </view>
                    <!-- 每轮底部汇总区：客户报价 / 报价反馈 / 核价金额 / 核价意见 -->
                    <view
                      v-for="(item, index) in roundSummaryItems"
                      :key="`summary_${index}`"
                      :class="['flex align-center', { 'full-width': item.fullWidth }]"
                    >
                      <view class="title-label-see mr-16">{{ item.label }}</view>
                      <view class="flex-1 break-word">
                        {{ getRoundSummaryValue(step, item.opType, item.key) || '-' }} {{ item.cell || '' }}
                      </view>
                    </view>
                  </view>
                </template>
              </StepperNavigation>
            </view>
            <view v-else-if="activeTabKey == 'contract'">
              <view class="mb-32 upload-box" v-if="detailsInfo.signingInfo.saleContract">
                <view class="tab-panel-title">二手车转让协议</view>
                <view class="gridBoxNoPadding">
                  <template v-for="(item, index) in vehicleItems">
                    <view
                      v-if="
                        (!detailsInfo.signingInfo.saleContract.depositPrice ? item.key !== 'signingInfo.saleContract.depositPrice' && item.key !== 'signingInfo.saleContract.finalPrice' : item.key !== 'signingInfo.saleContract.fullPrice') &&
                        (item.key !== 'signingInfo.saleContract.thirdPartyTransactionVoucher' || formatValue(item, detailsInfo)) &&
                        (item.key !== 'signingInfo.saleContract.handler' || detailsInfo.signingInfo.saleContract.signerType === 2) &&
                        (item.key !== 'signingInfo.saleContract.idCard' || detailsInfo.signingInfo.saleContract.signerType === 0 || detailsInfo.signingInfo.saleContract.signerType === 1) &&
                        (item.key !== 'signingInfo.saleContract.orgLicenseNumber' || detailsInfo.signingInfo.saleContract.signerType === 1 || detailsInfo.signingInfo.saleContract.signerType === 2) &&
                        (item.key !== 'signingInfo.saleContract.idCardFrontUrl' || (formatValue(item, detailsInfo) && (detailsInfo.signingInfo.saleContract.signerType === 0 || detailsInfo.signingInfo.saleContract.signerType === 1))) &&
                        (item.key !== 'signingInfo.saleContract.idCardBackUrl' || (formatValue(item, detailsInfo) && (detailsInfo.signingInfo.saleContract.signerType === 0 || detailsInfo.signingInfo.saleContract.signerType === 1))) &&
                        (item.key !== 'signingInfo.saleContract.orgLicenseUrl' || (formatValue(item, detailsInfo) && (detailsInfo.signingInfo.saleContract.signerType === 1 || detailsInfo.signingInfo.saleContract.signerType === 2)))
                      "
                      :key="index"
                      :class="['flex align-start', { 'full-width': item.fullWidth }, { 'align-center': item.type == 'link' }]"
                    >
                      <view class="title-label-see mr-16">{{ item.label }}</view>
                      <view v-if="item.type == 'image'">
                        <!-- 三方/委托交易凭证可能是视频 -->
                        <view v-if="item.key === 'signingInfo.saleContract.thirdPartyTransactionVoucher' && isVideoUrl(formatValue(item, detailsInfo))" class="uploaded-media-container">
                          <view class="video-container">
                            <image :src="getVideoThumbnail(formatValue(item, detailsInfo))" mode="aspectFill" class="uploaded-media" @click.stop="previewMedia(formatValue(item, detailsInfo), 2)"></image>
                            <view class="video-play-icon">
                              <view class="sprite-icon icon-upload-play"></view>
                            </view>
                          </view>
                        </view>
                        <image v-else :src="getImageDisplayUrl(formatValue(item, detailsInfo))" @click.stop="previewMedia(formatValue(item, detailsInfo), 1)"></image>
                      </view>
                      <view v-else-if="item.type == 'link'" class="flex-1" @click.stop="pdfPreview(detailsInfo.signingInfo.saleContract.contractNo)">
                        <view class="pdf-box flex align-center justify-between">
                          <view class="flex align-center">
                            <view class="sprite-icon icon-pdf"></view>
                            <text>二手车转让协议</text>
                          </view>
                        </view>
                      </view>
                      <view v-else>{{ formatValue(item, detailsInfo) }}{{ item.cell || '' }}</view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="mb-32 upload-box">
                <view class="tab-panel-title">收款人信息</view>
                <view class="gridBoxNoPadding">
                  <template v-for="(item, index) in payeeItems">
                    <view v-if="item.alwaysShow || formatValue(item, detailsInfo)" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }, { 'align-center': item.type == 'link' }]">
                      <view class="title-label-see mr-16">{{ item.label }}</view>
                      <view v-if="item.type == 'image'">
                        <image :src="getImageDisplayUrl(formatValue(item, detailsInfo))" @click.stop="previewMedia(formatValue(item, detailsInfo), 1)"></image>
                      </view>
                      <view v-else-if="item.type == 'link'" class="flex-1">
                        <view class="pdf-box flex align-center justify-between">
                          <view class="flex align-center">
                            <view class="sprite-icon icon-icon-select"></view>
                            <text>车辆代保管协议</text>
                          </view>
                        </view>
                      </view>
                      <view v-else>{{ formatValue(item, detailsInfo) }}</view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="mb-32 upload-box" v-if="detailsInfo.signingInfo.custodyContract">
                <view class="tab-panel-title">车辆代保管协议</view>
                <view class="gridBoxNoPadding">
                  <template v-for="(item, index) in vehicleManagementItems">
                    <view v-if="formatValue(item, detailsInfo)" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }, { 'align-center': item.type == 'link' }]">
                      <view class="title-label-see mr-16">{{ item.label }}</view>
                      <view v-if="item.type == 'image'">
                        <image :src="getImageDisplayUrl(formatValue(item, detailsInfo))" @click.stop="previewMedia(formatValue(item, detailsInfo), 1)"></image>
                      </view>
                      <view v-else-if="item.type == 'link'" class="flex-1" @click.stop="pdfPreview(detailsInfo.signingInfo.custodyContract.contractNo)">
                        <view class="pdf-box flex align-center justify-between">
                          <view class="flex align-center">
                            <view class="sprite-icon icon-pdf"></view>
                            <text>车辆代保管协议</text>
                          </view>
                        </view>
                      </view>
                      <view v-else>{{ formatValue(item, detailsInfo) }}</view>
                    </view>
                  </template>
                </view>
              </view>
            </view>
            <view v-else-if="activeTabKey == 'payment'">
              <view class="mb-32 upload-box">
                <view class="tab-panel-title">支付记录</view>
                <view class="tableBox">
                  <view class="tableHeader">
                    <view>支付方式</view>
                    <view>支付状态</view>
                    <view>支付时间</view>
                    <view>支付金额</view>
                  </view>
                  <view v-for="(item, index) in detailsInfo.paymentList || []" :key="index" class="tableRow">
                    <view class="tableCell">{{ item.paymentType == 1 ? '定金' : item.paymentType == 2 ? '尾款' : '全款' }}</view>
                    <view class="tableCell">
                      <view class="flex align-center justify-center">
                        <view class="status" :class="item.status == 1 ? 'status-10' : 'status-30'">{{ item.status == 1 ? '未支付' : '已支付' }}</view>
                      </view>
                    </view>
                    <view class="tableCell">{{ item.payTime || '-' }}</view>
                    <view class="tableCell">{{ item.paymentAmount ? '¥' + item.paymentAmount : '-' }}</view>
                  </view>
                  <!-- 当没有数据时显示空状态 -->
                  <view v-if="!detailsInfo.paymentList || detailsInfo.paymentList.length === 0" class="empty-table">
                    <text>暂无支付记录</text>
                  </view>
                </view>
              </view>
            </view>
            <view v-else-if="activeTabKey == 'delivery'">
              <view class="mb-32 upload-box">
                <view class="tab-panel-title">基础信息</view>
                <view class="gridBoxNoPadding">
                  <view v-for="(item, index) in baseInfoItems" :key="index" :class="['flex align-center', { 'full-width': item.fullWidth }]">
                    <view class="title-label-see mr-16">{{ item.label }}</view>
                    <view>{{ formatValue(item, detailsInfo) }}</view>
                  </view>
                </view>
              </view>
              <view class="mb-32 upload-box" v-if="hasCarHandoverInfoImage">
                <view class="tab-panel-title">车辆图片</view>
                <view class="gridBoxNoPadding">
                  <template v-for="(item, index) in uploadFieldsItems">
                    <view v-if="formatValue(item, detailsInfo)" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }, { 'align-center': item.type == 'link' }]">
                      <view class="title-label-see mr-16">{{ item.label }}</view>
                      <view v-if="item.type == 'image'" class="flex-1">
                        <template v-if="item.key === 'carHandoverInfo.handoverPhotoMore'">
                          <image @click.stop="previewMedia(url, 1)" v-for="(url, idx) in splitMediaUrls(formatValue(item, detailsInfo))" :key="idx" :src="getImageDisplayUrl(url)" mode="aspectFill" style="margin-right: 10px"></image>
                        </template>
                        <template v-else>
                          <image :src="getImageDisplayUrl(formatValue(item, detailsInfo))" @click.stop="previewMedia(formatValue(item, detailsInfo), 1)"></image>
                        </template>
                      </view>
                      <view v-else-if="item.type == 'link'" class="flex-1">
                        <view class="pdf-box flex align-center justify-between">
                          <view class="flex align-center">
                            <view class="sprite-icon icon-pdf"></view>
                            <text>二手车转让协议</text>
                          </view>
                        </view>
                      </view>
                      <view v-else>{{ formatValue(item, detailsInfo) }}</view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="mb-32 upload-box">
                <view class="tab-panel-title">证件资料</view>
                <view class="gridBoxNoPadding">
                  <template v-for="(item, index) in documentationItems">
                    <view v-if="formatValue(item, detailsInfo)" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }, { 'align-center': item.type == 'link' }]">
                      <view class="title-label-see mr-16">{{ item.label == '自定义字段名称' ? detailsInfo.carHandoverInfo.otherText || '自定义字段名称' : item.label }}</view>
                      <view v-if="item.type == 'image'">
                        <template v-if="item.key === 'carHandoverInfo.motorBookUrl' || item.key === 'carHandoverInfo.motorRegistrationCertificateUrl'">
                          <image @click.stop="previewMedia(url, 1)" v-for="(url, idx) in splitMediaUrls(formatValue(item, detailsInfo))" :key="idx" :src="getImageDisplayUrl(url)" mode="aspectFill" style="margin-right: 10px"></image>
                        </template>
                        <template v-else>
                          <!-- 过户授权委托书可能是视频 -->
                          <view v-if="item.key === 'carHandoverInfo.transferPhotoUrl' && isVideoUrl(formatValue(item, detailsInfo))" class="uploaded-media-container">
                            <view class="video-container">
                              <image :src="getVideoThumbnail(formatValue(item, detailsInfo))" mode="aspectFill" class="uploaded-media" @click.stop="previewMedia(formatValue(item, detailsInfo), 2)"></image>
                              <view class="video-play-icon">
                                <view class="sprite-icon icon-upload-play"></view>
                              </view>
                            </view>
                          </view>
                          <image v-else :src="getImageDisplayUrl(formatValue(item, detailsInfo))" @click.stop="previewMedia(formatValue(item, detailsInfo), 1)"></image>
                        </template>
                      </view>
                      <view v-else-if="item.type == 'link'" class="flex-1">
                        <view class="pdf-box flex align-center justify-between">
                          <view class="flex align-center">
                            <view class="sprite-icon icon-pdf"></view>
                            <text>二手车买卖补充协议</text>
                          </view>
                        </view>
                      </view>
                      <view v-else>{{ formatValue(item, detailsInfo) }}</view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="mb-32 upload-box" v-if="detailsInfo.carHandoverInfo">
                <view class="tab-panel-title">合同预览</view>
                <view class="gridBoxNoPadding">
                  <template v-for="(item, index) in contractItems">
                    <view v-if="getFieldValue(detailsInfo, item.key)" :key="index" :class="['flex align-start', { 'full-width': item.fullWidth }]">
                      <view class="title-label-see mr-16">{{ item.label }}</view>
                      <view class="flex-1">
                        <view class="pdf-box flex align-center justify-between" @click.stop="pdfPreview(getFieldValue(detailsInfo, item.key))">
                          <view class="flex align-center">
                            <view class="sprite-icon icon-pdf"></view>
                            <text>{{ item.contractName }}</text>
                          </view>
                        </view>
                      </view>
                    </view>
                  </template>
                </view>
              </view>
            </view>
            <view v-else-if="activeTabKey == 'editRecords'">
              <StepperNavigation :currentStep="currentStep" :steps="detailsInfo.editLogList" direction="vertical">
                <template v-slot="{ step, indexContent }">
                  <view class="tableContent">
                    <view class="gridBoxNoPadding mb-16" v-if="indexContent != detailsInfo.editLogList.length - 1">
                      <view :class="['flex align-center']">
                        <view class="title-label-see mr-16">订单状态</view>
                        <view :class="['bg-transparent', statusClass(detailsInfo.editLogList[indexContent].status)]">{{ statusMap[detailsInfo.editLogList[indexContent].status].name || '-' }}</view>
                      </view>
                      <view :class="['flex align-center']">
                        <view class="title-label-see mr-16">编辑人员</view>
                        <view>{{ detailsInfo.editLogList[indexContent].editor || '-' }}</view>
                      </view>
                      <view>
                        <view class="title-label-see mr-16">变更内容</view>
                      </view>
                    </view>
                    <view v-else class="gridBoxNoPadding mb-16">
                      <view :class="['flex align-center']">
                        <view class="title-label-see mr-16">编辑人员</view>
                        <view>{{ detailsInfo.editLogList[indexContent].editor || '-' }}</view>
                      </view>
                    </view>
                    <view v-if="indexContent != detailsInfo.editLogList.length - 1">
                      <view class="tableBox">
                        <view class="tableHeader">
                          <view>变更项</view>
                          <view>变更类型</view>
                          <view>原内容</view>
                          <view>变更后内容</view>
                        </view>
                        <view v-for="(item, index) in detailsInfo.editLogList[indexContent].changeList || []" :key="index" class="tableRow">
                          <view class="tableCell">{{ item.fieldName }}</view>
                          <view class="tableCell">{{ item.fieldType == 'text' ? '文本' : item.fieldType == 'image' ? '图片' : '视频' }}变更</view>
                          <view class="tableCell">
                            <view v-if="item.fieldType == 'text'">
                              {{ item.fieldBeforeValue || '-' }}
                            </view>
                            <template v-if="item.fieldBeforeValue">
                              <view v-if="item.fieldType == 'image'">
                                <template v-for="(url, idx) in splitMediaUrls(item.fieldBeforeValue)">
                                  <image @click.stop="previewMedia(url, 1)" v-if="splitMediaUrls(item.fieldBeforeValue).length > 0" :key="idx" :src="getImageDisplayUrl(url)" mode="aspectFill" style="margin-right: 10px; width: 80px; height: 80px"></image>
                                  <!-- <view>{{ item.fieldBeforeValue }}</view> -->
                                </template>
                              </view>
                              <view v-else-if="item.fieldType == 'video'">
                                <image @click.stop="previewMedia(url, 2)" v-for="(url, idx) in splitMediaUrls(item.fieldBeforeValue)" :key="idx" :src="getVideoThumbnail(url)" mode="aspectFill" style="margin-right: 10px; width: 80px; height: 80px"></image>
                              </view>
                            </template>
                          </view>
                          <view class="tableCell">
                            <view v-if="item.fieldType == 'text'">
                              {{ item.fieldAfterValue || '-' }}
                            </view>
                            <template v-if="item.fieldAfterValue">
                              <view v-if="item.fieldType == 'image'">
                                <template v-for="(url, idx) in splitMediaUrls(item.fieldAfterValue)">
                                  <image @click.stop="previewMedia(url, 1)" v-if="splitMediaUrls(item.fieldAfterValue).length > 0" :key="idx" :src="getImageDisplayUrl(url)" mode="aspectFill" style="margin-right: 10px; width: 80px; height: 80px"></image>
                                  <!-- <view>{{ item.fieldAfterValue }}</view> -->
                                </template>
                              </view>
                              <view v-else-if="item.fieldType == 'video'">
                                <image @click.stop="previewMedia(url, 2)" v-for="(url, idx) in splitMediaUrls(item.fieldAfterValue)" :key="idx" :src="getVideoThumbnail(url)" mode="aspectFill" style="margin-right: 10px; width: 80px; height: 80px"></image>
                              </view>
                            </template>
                          </view>
                        </view>
                        <!-- 当没有数据时显示空状态 -->
                        <view v-if="!detailsInfo.editLogList[indexContent].changeList || detailsInfo.editLogList[indexContent].changeList.length === 0" class="empty-table">
                          <text>暂无变更记录</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </template>
              </StepperNavigation>
            </view>
            <!-- 其他标签页可以在这里添加 -->
            <view v-else class="empty-content">
              <text>暂无{{ tabs.find(tab => tab.key === activeTabKey) ? tabs.find(tab => tab.key === activeTabKey).name : '' }}信息</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import MediaInfo from './components/MediaInfo'
import { fileSuibtype } from './evaluationFormMap'
import StepperNavigation from './components/StepperNavigation'
import { statusMap, usageTypeMap, ownerTypeMap, sunroofMap, vehicleCategoryMap, buyNewCarMap, hasAccidentMap, overallRatingMap, emissionStandardMap } from './evaluationFormMap.js'
import { getImageDisplayUrl } from '@/utils/ossImageProcess.js'
export default {
  components: {
    MediaInfo,
    StepperNavigation
  },
  data() {
    return {
      videoProcess: '?x-oss-process=video/snapshot,t_7000,f_jpg,w_800,h_600,m_fast',
      imageDatas: {
        carImageList: [
          {
            id: 1,
            url: 'https://img.58tg.com/up/allimg/4k/s/03/2309201256325P4-0-lp.jpg',
            alt: fileSuibtype[11].name
          },
          {
            id: 2,
            url: 'https://img.58tg.com/up/allimg/4k/s/03/2309201256325P4-0-lp.jpg',
            alt: fileSuibtype[12].name
          }
        ],
        carVideoList: [
          {
            id: 1,
            url: 'https://img02.glsx.com.cn/weapp/resource/saas/video/car.mp4',
            alt: fileSuibtype[32].name
          },
          {
            id: 2,
            url: 'https://img02.glsx.com.cn/weapp/resource/saas/video/car.mp4',
            alt: fileSuibtype[32].name
          }
        ]
      },
      detailsInfo: null,
      currentStep: 1,
      statusMap,
      usageTypeMap,
      ownerTypeMap,
      sunroofMap,
      vehicleCategoryMap,
      buyNewCarMap,
      hasAccidentMap,
      overallRatingMap,
      emissionStandardMap,
      activeTabKey: 'carInfo',
      tabs: [
        { name: '车辆信息', key: 'carInfo' },
        { name: '牌证信息', key: 'carLicense' },
        { name: '图像信息', key: 'images' },
        { name: '评估信息', key: 'evaluation', hidden: true },
        { name: '签约信息', key: 'contract', hidden: true },
        { name: '支付信息', key: 'payment', hidden: true },
        { name: '交车确认', key: 'delivery', hidden: true },
        { name: '编辑记录', key: 'editRecords', hidden: true }
      ],
      carInfoItems: [
        { label: '销售顾问', key: 'basic.sellerMerchantName', formatter: (val, data) => `${val}${' | '} ${data.basic.sellerName}` },
        { label: '品牌车型', key: 'carInfo.carSeriesName', formatter: (val, data) => `${val} ${data.carInfo.carTypeName}` },
        { label: '车架号', key: 'carInfo.vin' },
        { label: '车牌号', key: 'carInfo.licensePlate' },
        { label: '发动机号', key: 'carInfo.engineNumber' },
        { label: '上牌时间', key: 'carInfo.registrationDate' },
        { label: '上牌城市', key: 'carInfo.registrationProvinceName', formatter: (val, data) => `${val}-${data.carInfo.registrationCityName}` },
        { label: '车辆所在地', key: 'carInfo.carProvinceName', formatter: (val, data) => `${val}-${data.carInfo.carCityName}` },
        { label: '表显里程', key: 'carInfo.mileage', cell: '公里' },
        { label: '使用性质', key: 'carInfo.usageType', map: 'usageTypeMap' },
        { label: '所有人性质', key: 'carInfo.ownerType', map: 'ownerTypeMap' },
        { label: '天窗', key: 'carInfo.sunroof', map: 'sunroofMap' },
        { label: '车辆类别', key: 'carInfo.vehicleCategory', map: 'vehicleCategoryMap' },
        { label: '排放标准', key: 'carInfo.emissionStandard', map: 'emissionStandardMap' },
        { label: '外观颜色', key: 'carInfo.exteriorColor' },
        { label: '内饰颜色', key: 'carInfo.interiorColor' },
        { label: '生产日期', key: 'carInfo.productionDate' },
        { label: '指导价', key: 'carInfo.guidePrice', cell: '元' },
        { label: '是否购买新车', key: 'carInfo.buyNewCar', map: 'buyNewCarMap' },
        { label: '是否事故车', key: 'carInfo.hasAccident', map: 'hasAccidentMap' },
        { label: '综合评价', key: 'carInfo.overallRating', map: 'overallRatingMap', fullWidth: true },
        { label: '车况描述', key: 'carInfo.conditionDescription', fullWidth: true }
      ],
      carLicenseItems: [
        { label: '钥匙数', key: 'carLicense.keyCount' },
        { label: '过户次数', key: 'carLicense.transferCount' },
        { label: '交强险到期', key: 'carLicense.compulsoryInsuranceExpiry' },
        { label: '年审到期', key: 'carLicense.annualInspectionExpiry' },
        { label: '商业险到期', key: 'carLicense.commercialInsuranceExpiry' },
        { label: '原车主名称', key: 'carLicense.previousOwnerName' },
        { label: '原车主电话', key: 'carLicense.previousOwnerPhone', fullWidth: true },
        { label: '原车主住址', key: 'carLicense.previousOwnerAddress', fullWidth: true }
      ],
      // 评估师单次报价展示字段（仅用于 opType = 10）
      priceItems: [
        { label: '评估价格', key: 'evalPriceDisplay' },
        { label: '评估意见', key: 'evalOpinion', fullWidth: true }
      ],
      // 每轮底部汇总信息（来自不同 opType）
      roundSummaryItems: [
        { label: '客户报价', key: 'customerTargetPriceDisplay', opType: 20 },
        { label: '报价反馈', key: 'customerTargetPriceFeedback', opType: 20, fullWidth: true },
        { label: '核价金额', key: 'evalPriceDisplay', opType: 40 },
        // 核价意见同样来自核价记录（opType 40）
        { label: '核价意见', key: 'evalOpinion', opType: 40, fullWidth: true }
      ],
      editItems: [
        { label: '订单状态', key: 'status' },
        { label: '编辑人员', key: 'editor' }
      ],
      vehicleItems: [
        { label: '合同编号', key: 'signingInfo.saleContract.contractNo' },
        { label: '签约时间', key: 'signingInfo.saleContract.signTime' },
        { label: '定金金额', key: 'signingInfo.saleContract.depositPrice', cell: '元' },
        { label: '尾款金额', key: 'signingInfo.saleContract.finalPrice', cell: '元' },
        { label: '全款金额', key: 'signingInfo.saleContract.fullPrice', cell: '元' },
        { label: '签约车主', key: 'signingInfo.saleContract.partAName' },
        {
          label: '签署人类型',
          key: 'signingInfo.saleContract.signerType',
          formatter: value => {
            if (value === 1) return '企业委托'
            if (value === 0) return '个人'
            if (value === 2) return '企业'
            return value || '-'
          }
        },
        { label: '经办人', key: 'signingInfo.saleContract.handler' },
        { label: '手机号码', key: 'signingInfo.saleContract.phone' },
        { label: '身份证号', key: 'signingInfo.saleContract.idCard' },
        { label: '营业执照号', key: 'signingInfo.saleContract.orgLicenseNumber' },
        { label: '合同模版名称', key: 'signingInfo.saleContract.docTemplateName' },
        { label: '交车时间', key: 'signingInfo.saleContract.handoverTime' },
        { label: '交车地点', key: 'signingInfo.saleContract.handoverAddress' },
        { label: '身份证国徽面', key: 'signingInfo.saleContract.idCardFrontUrl', type: 'image' },
        { label: '身份证人像面', key: 'signingInfo.saleContract.idCardBackUrl', type: 'image' },
        { label: '营业执照图片', key: 'signingInfo.saleContract.orgLicenseUrl', type: 'image' },
        { label: '三方/委托交易凭证', key: 'signingInfo.saleContract.thirdPartyTransactionVoucher', type: 'image' },
        { label: '查阅合同', key: 'signingInfo.saleContract.contractUrl', type: 'link' }
      ],
      payeeItems: [
        { label: '收款人姓名', key: 'signingInfo.saleContract.payeeName' },
        { label: '银行卡账号', key: 'signingInfo.saleContract.bankCardNumber' },
        { label: '开户行', key: 'signingInfo.saleContract.bankOfDeposit' },
        { label: '回单摘要', key: 'signingInfo.saleContract.returnSummaryRemark', alwaysShow: true },
        { label: '身份证国徽面', key: 'signingInfo.saleContract.payerIdCardFrontUrl', type: 'image' },
        { label: '身份证人像面', key: 'signingInfo.saleContract.payerIdCardBackUrl', type: 'image' },
        { label: '银行卡', key: 'signingInfo.saleContract.payerBankCardUrl', type: 'image' }
      ],
      vehicleManagementItems: [
        { label: '合同编号', key: 'signingInfo.custodyContract.contractNo' },
        { label: '签约时间', key: 'signingInfo.custodyContract.signTime' },
        { label: '保管人姓名', key: 'signingInfo.custodyContract.custodianName' },
        { label: '手机号码', key: 'signingInfo.custodyContract.custodianPhone' },
        { label: '查阅合同', key: 'signingInfo.custodyContract.docTemplateName', type: 'link' }
      ],
      baseInfoItems: [
        { label: '确认人', key: 'carHandoverInfo.operator' },
        { label: '确认时间', key: 'carHandoverInfo.handoverTime' },
        { label: '车钥匙数', key: 'carHandoverInfo.carKeyCount' }
      ],
      contractItems: [
        { label: '车辆交车单', key: 'carHandoverInfo.handleOverContractNo', contractName: '车辆交车确认单' },
        { label: '补充协议', key: 'carHandoverInfo.supplementaryContractNo', contractName: '二手车补充协议' }
      ],
      uploadFieldsItems: [
        {
          key: 'carHandoverInfo.handoverPhotoFrontFourFive',
          label: '正面45度',
          type: 'image'
        },
        { key: 'carHandoverInfo.handoverPhotoFront', label: '正面', type: 'image' },
        { key: 'carHandoverInfo.handoverPhotoBack', label: '后面', type: 'image' },
        { key: 'carHandoverInfo.handoverPhotoLeftSide', label: '左侧面', type: 'image' },
        { key: 'carHandoverInfo.handoverPhotoRightSide', label: '右侧面', type: 'image' },
        { key: 'carHandoverInfo.handoverPhotoMore', label: '其他', type: 'image' }
      ],
      documentationItems: [
        { label: '交强险', key: 'carHandoverInfo.trafficInsuranceUrl', type: 'image' },
        { label: '机动车行驶证', key: 'carHandoverInfo.motorRegistrationCertificateUrl', type: 'image' },
        { label: '交管12123截图', key: 'carHandoverInfo.trafficScreenshotUrl', type: 'image' },
        { label: '机动车登记本', key: 'carHandoverInfo.motorBookUrl', type: 'image' },
        { label: '购置税证及收据', key: 'carHandoverInfo.purchaseReceiptUrl', type: 'image' },
        { label: '购车发票', key: 'carHandoverInfo.purchaseInvoiceUrl', type: 'image' },
        { label: '车钥匙', key: 'carHandoverInfo.carKeyUrl', type: 'image' },
        { label: '过户授权委托书', key: 'carHandoverInfo.transferPhotoUrl', type: 'image' },
        { label: '保险单商业保险单或卡', key: 'carHandoverInfo.insuranceCardUrl', type: 'image' },
        { label: '自定义字段名称', key: 'carHandoverInfo.otherUrl', type: 'image' }
      ],
      uploadFields: [
        {
          key: 11,
          label: '左前45度',
          required: true,
          maxCount: 1,
          accept: 'image'
        },
        { key: 12, label: '主驾驶全景', maxCount: 1, accept: 'image' },
        { key: 13, label: '仪表盘', maxCount: 1, accept: 'image' },
        { key: 14, label: '后排座椅', maxCount: 1, accept: 'image' },
        { key: 15, label: '中控台全景', maxCount: 1, accept: 'image' },
        { key: 16, label: '右后45度', maxCount: 1, accept: 'image' },
        { key: 17, label: '铭牌', maxCount: 1, accept: 'image' }
      ],
      uploadCertificateFields: [
        { key: 21, label: '行驶证', maxCount: 1, accept: 'image' },
        { key: 22, label: '登记证', maxCount: 3, accept: 'image' }
      ],
      uploadVideoFields: [
        { key: 31, label: '发动机工况', required: true, accept: 'video' },
        { key: 32, label: '车况解说', required: true, accept: 'video' }
      ],
      uploadReportFields: [{ key: 51, label: '车辆检测报告', required: true, accept: 'image' }],
      uploadOtherFields: [{ key: 41, label: '其他图片', required: true, accept: 'image' }]
    }
  },
  onLoad(options) {
    this.getDetail(options.evalOrderNo)
    uni.$track.add({ eventCode: 'app_evaluation_from_details' })
  },
  computed: {
    hasAnyVideo() {
      return this.uploadVideoFields.some(field => {
        const image = this.getImageBySubtype(field.key)
        return image && image.fileUrl
      })
    },
    hasAnyOtherImage() {
      return this.uploadOtherFields.some(field => {
        const image = this.getImageBySubtype(field.key)
        return image && (Array.isArray(image) ? image.length > 0 : image.fileUrl)
      })
    },
    shouldShowTwoColumns() {
      // 只有两个证件都有图片时才显示两列布局
      const drivingLicense = this.getImageBySubtype(21) // 行驶证
      const registration = this.getImageBySubtype(22) // 登记证

      const hasDrivingLicense = drivingLicense && drivingLicense.fileUrl
      const hasRegistration = registration && Array.isArray(registration) && registration.length > 0

      return hasDrivingLicense && hasRegistration
    },
    hasImageForField() {
      return fieldKey => {
        const images = this.getImageBySubtype(fieldKey)
        if (Array.isArray(images)) {
          return images.length > 0
        } else if (images) {
          return !!images.fileUrl
        }
        return false
      }
    },
    hasCertificateImage() {
      return this.uploadCertificateFields.some(field => {
        const images = this.getImageBySubtype(field.key)
        if (Array.isArray(images)) {
          // 对于数组类型（如登记证），检查是否有图片
          return images.length > 0
        } else if (images) {
          // 对于单张图片类型（如行驶证），检查是否有fileUrl
          return !!images.fileUrl
        }
        return false
      })
    },
    hasCarHandoverInfoImage() {
      return this.uploadFieldsItems.some(field => {
        const image = this.formatValue(field, this.detailsInfo)
        return image && (Array.isArray(image) ? image.length > 0 : image)
      })
    },
    hasAnyReportImage() {
      return this.uploadReportFields.some(field => {
        const image = this.getImageBySubtype(field.key)
        return image && (Array.isArray(image) ? image.length > 0 : image.fileUrl)
      })
    }
  },
  mounted() {},
  methods: {
    getImageDisplayUrl,
    backPage() {
      uni.navigateBack({
        delta: 1
      })
    },
    splitMediaUrls(urls) {
      if (!urls) return []
      if (Array.isArray(urls)) return urls.filter(u => u)
      // 注意：x-oss-process=image/format,jpg/quality,q_100 内含逗号，不能简单按逗号分割
      // 只在「逗号/分号后紧跟 http」处分割，避免误拆单条 URL
      const str = String(urls).trim()
      if (!str) return []
      return str
        .split(/\s*[,;]\s*(?=https?:\/\/)/)
        .map(u => u.trim())
        .filter(u => u)
    },
    // 判断URL是否是视频
    isVideoUrl(url) {
      if (!url) return false

      // 1. 检查是否包含阿里云视频处理参数
      if (url.includes(this.videoProcess)) {
        return true
      }

      // 2. 检查文件扩展名（视频格式）
      const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.m4v', '.3gp', '.mkv', '.webm']
      const urlLower = url.toLowerCase()
      const hasVideoExtension = videoExtensions.some(ext => {
        // 检查扩展名，需要排除查询参数
        const urlWithoutQuery = urlLower.split('?')[0].split('#')[0]
        return urlWithoutQuery.endsWith(ext)
      })

      return hasVideoExtension
    },
    // 获取视频缩略图URL
    getVideoThumbnail(url) {
      if (!url) return ''

      // 如果已经是阿里云链接且包含videoProcess，直接返回
      if (url.includes(this.videoProcess)) {
        return url
      }

      // 如果是阿里云OSS链接，添加videoProcess参数
      if (url.includes('aliyuncs.com') || url.includes('oss-')) {
        // 如果URL已经有查询参数，用&连接；否则用?连接
        const separator = url.includes('?') ? '&' : '?'
        return url + separator + this.videoProcess.replace('?', '')
      }

      // 如果不是阿里云链接（如小程序上传），返回默认视频图片
      return 'https://img02.glsx.com.cn/weapp/resource/dj-car-boutique-work-wechat/usedCar/video_default.png'
    },
    statusClass(status) {
      return status > 0 ? `status-${status}` : 'status-0'
    },
    getDetail(evalOrderNo) {
      const that = this
      uni.$api.evaluationApi
        .evalOrderDetail({
          evalOrderNo
        })
        .then(res => {
          if (res.data.code == 0) {
            const data = res.data.data || {}

            // priceHistory 字段废弃：统一使用 priceHistoryByRound（按轮分组）
            if (!Array.isArray(data.priceHistoryByRound)) data.priceHistoryByRound = []
            // 规范化每轮数据：保证 priceHistoryList 为数组，并保持接口返回的原始顺序
            // 如需按时间排序，请在后端/调用方显式处理；这里不做二次排序，避免影响展示顺序
            data.priceHistoryByRound = data.priceHistoryByRound.map(r => {
              const list = Array.isArray(r?.priceHistoryList) ? r.priceHistoryList.filter(Boolean) : []
              const quoteTime = r?.quoteTime || list[list.length - 1]?.quoteTime || ''
              return {
                ...r,
                roundNo: r?.roundNo,
                quoteTime,
                priceHistoryList: list
              }
            })

            that.detailsInfo = data

            // 判断评估信息
            if (that.detailsInfo.priceHistoryByRound && that.detailsInfo.priceHistoryByRound.length > 0) {
              that.tabs.find(i => i.key === 'evaluation').hidden = false
            }
            if (that.detailsInfo.paymentList && that.detailsInfo.paymentList.length > 0) {
              // 判断支付信息
              that.tabs.find(i => i.key === 'payment').hidden = false
            }
            if (that.detailsInfo.signingInfo.saleContract) {
              // 判断签约信息
              that.tabs.find(i => i.key === 'contract').hidden = false
            }
            if (that.detailsInfo.editLogList && that.detailsInfo.editLogList.length > 0) {
              // 判断编辑记录
              that.tabs.find(i => i.key === 'editRecords').hidden = false
            }
            if (that.detailsInfo.carHandoverInfo && that.detailsInfo.images.length > 0) {
              // 判断交车确认
              that.tabs.find(i => i.key === 'delivery').hidden = false
            }
          } else {
            uni.hideLoading()
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
          }
        })
    },
    switchTabByKey(key) {
      uni.$track.add({ eventCode: 'app_evaluation_tabChange' })
      // 确保切换的key存在于当前的tabs数组中
      const tabExists = this.tabs.some(tab => tab.key === key)
      if (tabExists) {
        this.activeTabKey = key
      }
    },
    getFieldValue(obj, path) {
      if (!obj || !path) return ''
      const keys = path.split('.')
      let value = obj
      for (const key of keys) {
        value = value[key]
        if (value === undefined || value === null) {
          return ''
        }
      }
      return value
    },
    // 格式化显示值
    formatValue(item, data) {
      const rawValue = this.getFieldValue(data, item.key)
      if (item.formatter && typeof item.formatter === 'function') {
        return item.formatter(rawValue, data)
      }
      if (item.map && this[item.map]) {
        return this[item.map][rawValue] || rawValue
      }
      console.log('rawValue:', rawValue === 0 ? 0 : item.type === 'image' || item.accept === 'video' ? rawValue : rawValue || '-', item.key, item)
      return rawValue === 0 ? 0 : item.type === 'image' || item.accept === 'video' ? rawValue : rawValue || '-'
    },
    // 取当前轮次中所有评估师报价（opType = 10）
    getRoundQuotes(step) {
      const list = Array.isArray(step?.priceHistoryList) ? step.priceHistoryList : []
      return list.filter(i => String(i.opType) === '10')
    },
    // 取当前轮次底部汇总字段（根据 opType + 字段名）
    getRoundSummaryValue(step, opType, key) {
      const list = Array.isArray(step?.priceHistoryList) ? step.priceHistoryList : []
      const record = list.find(i => String(i.opType) === String(opType))
      return record ? record[key] : ''
    },
    getImageBySubtype(subtype) {
      if (!this.detailsInfo.images) return []
      if (subtype === 41 || subtype === 22 || subtype === 51) {
        return this.detailsInfo.images.filter(img => img.fileSubtype === subtype)
      }
      const obj = this.detailsInfo.images.find(img => img.fileSubtype === subtype) || null
      return obj
    },
    getImageByKey(subtype) {
      const obj = this.detailsInfo.images.find(img => img.fileSubtype === subtype) || null
      return obj
    },
    getImageLabel(fileSubtype) {
      return this.fileSuibtype[fileSubtype]?.name || `未知类型(${fileSubtype})`
    },
    previewMedia(media, type) {
      console.log('media:', media)
      const url = `/pages/boutique/preview?tabName=预览&sourceType=${type}&detailUrl=${media.url || media}`
      uni.navigateTo({
        url: `${url}`
      })
    },
    pdfPreview(contractNo) {
      console.log('contractNo:', contractNo)
      uni.$api.evaluationApi
        .viewOnlineContract({
          contractNo: contractNo
        })
        .then(res => {
          console.log('res:', res)
          if (res.data.code == 0) {
            const url = `/pages/evaluationForm/components/pdfPreView?fileUrl=${res.data.data.contractUrl}&title=pdf&fileType=pdf&Signature=false&fileUrltype=${res.data.data.format == 'html' ? 'html' : 'pdf'}`
            uni.navigateTo({
              url: `${url}`
            })
          } else {
            uni.hideLoading()
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
          }
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.details-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  padding: toRpx(160) toRpx(64) toRpx(48);
  box-sizing: border-box;
  .detail-content {
    width: 100%;
    height: calc(100% - #{toRpx(64)});
    box-sizing: border-box;
    overflow: auto;
    .box-class {
      height: 100%;
      background: #ffffff59;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      overflow: hidden;
      padding: 0 0 toRpx(42);
      box-sizing: border-box;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        z-index: -2;
        width: 100%;
        height: toRpx(120);
        background: linear-gradient(0deg, #94c2ff00 0%, #5294ff 100%);
        opacity: 0.15;
      }
      &::before {
        content: '';
        position: absolute;
        left: toMinusRpx(20);
        top: toMinusRpx(28);
        z-index: -1;
        width: toRpx(136);
        height: toRpx(136);
        opacity: 0.6;
        background: linear-gradient(-44.4deg, #94c2ff00 0%, #5294ff 100%);
        filter: blur(toRpx(24));
      }
      .tab-container {
        margin-bottom: toRpx(32);
        margin-top: toRpx(32);
        position: sticky;
        top: 0;
        z-index: 10;
        border-radius: toRpx(48) toRpx(48) 0 0;
        padding: 0 toRpx(48);
        .tab-scroll {
          width: 100%;
          display: flex;
          white-space: nowrap;
          .tab-item {
            width: toRpx(208);
            height: toRpx(72);
            border: toRpx(2) solid #ffffffcc;
            border-radius: toRpx(16);
            background: #ffffff;
            backdrop-filter: blur(12px);
            display: inline-block;
            text-align: center;
            line-height: toRpx(72);
            color: #666666;
            position: relative;
            cursor: pointer;
            transition: color 0.3s;
            margin-right: toRpx(16);
            &.active {
              color: #fff;
              background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
              box-shadow: toRpx(4) toRpx(8) toRpx(16) 0 #81a3d659;
              border: toRpx(2) solid #ffffff;
            }
            .tab-active-line {
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: toRpx(48);
              height: toRpx(6);
              background-color: #347bff;
              border-radius: toRpx(3);
              opacity: 0;
              transition: opacity 0.3s;
              &.show {
                opacity: 1;
              }
            }
          }
        }
      }
      .tab-panel-container {
        padding: 0 toRpx(48);
        overflow: auto;
        height: calc(100% - #{toRpx(114)});
      }
      .tab-panel {
        border-radius: toRpx(16);
        background: #ffffff;
        padding: toRpx(24) toRpx(32) 0 toRpx(32);
        .tab-panel-title {
          font-size: toRpx(32);
          font-weight: 600;
          color: #333333;
          margin-bottom: toRpx(24);
        }
        .gridBoxNoPadding {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: toRpx(28);
          border-radius: toRpx(16);
          background: #ffffff;
          box-sizing: border-box;
          .title-label-see {
            width: toRpx(198);
            color: #999999;
            font-size: toRpx(28);
            font-weight: 400;
          }
          image {
            width: toRpx(240);
            height: toRpx(240);
            border-radius: toRpx(12);
            background: #f4f5f7;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .pdf-box {
            padding: toRpx(12) toRpx(20);
            box-sizing: border-box;
            height: toRpx(64);
            border-radius: toRpx(8);
            background: #f4f5f7;
            color: #333333;
            font-size: toRpx(28);
            font-weight: 400;
            .sprite-icon {
              margin-right: toRpx(16);
            }
            .btn {
              color: #4673ff;
              margin-left: toRpx(32);
            }
          }
        }
        .gridBox {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: toRpx(28);
          border-radius: toRpx(16);
          background: #ffffff;
          padding-top: toRpx(28);
          padding-bottom: toRpx(28);
          box-sizing: border-box;
          .title-label-see {
            width: toRpx(198);
            color: #999999;
            font-size: toRpx(28);
            font-weight: 400;
          }
          image {
            width: toRpx(240);
            height: toRpx(240);
            border-radius: toRpx(12);
            background: #f4f5f7;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .pdf-box {
            padding: toRpx(12) toRpx(20);
            box-sizing: border-box;
            height: toRpx(64);
            border-radius: toRpx(8);
            background: #f4f5f7;
            color: #333333;
            font-size: toRpx(28);
            font-weight: 400;
            .sprite-icon {
              margin-right: toRpx(16);
            }
            .btn {
              color: #4673ff;
              margin-left: toRpx(32);
            }
          }
        }
        .empty-content {
          text-align: center;
          padding: toRpx(100) 0;
          color: #999999;
          font-size: toRpx(28);
        }
        .upload-box {
          background: #ffffff;
          padding: toRpx(24) toRpx(32);
          border-radius: toRpx(16);
          box-sizing: border-box;
        }
        .upload-grid {
          display: grid;
          gap: toRpx(24);
          grid-template-columns: repeat(3, 1fr);
          border-radius: toRpx(16);
        }
        .upload-grid.two-columns {
          grid-template-columns: repeat(2, 1fr);
        }
        .upload-item-container {
          align-items: flex-start;
          // margin-bottom: toRpx(32);
          .upload-label {
            color: #666666;
            font-size: toRpx(26);
            font-weight: 400;
            display: flex;
            align-items: flex-start;
            margin-right: toRpx(42);
            width: toRpx(180);
            margin-bottom: toRpx(16);
          }
          .requiredLabel {
            color: #f24724;
            font-size: toRpx(28);
            font-weight: 400;
            margin-left: toRpx(8);
          }
          .upload-images-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: toRpx(16);
            flex: 1;
            min-width: 0;
          }
          &.fullwidth {
            grid-column: 1 / -1; // 跨越所有列
            .upload-label {
              flex: none;
            }
            .upload-images-wrapper {
              width: 100%;
            }
          }
        }
        .upload-item-container.two-thirds {
          grid-column: span 2;
          .upload-images-wrapper {
            width: 100%;
          }
        }
        .upload-item {
          height: toRpx(240);
          border-radius: toRpx(12);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          opacity: 1;
          background: #f5f8ff;
          width: toRpx(240);
        }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999999;
        }
        .upload-text {
          margin-top: toRpx(12);
          font-size: toRpx(24);
        }
        /* 已上传媒体样式 */
        .uploaded-media-container {
          position: relative;
          height: toRpx(240);
          border-radius: toRpx(12);
          overflow: hidden;
          width: toRpx(240);
        }
        .uploaded-media {
          width: 100%;
          height: 100%;
        }
        /* 视频容器样式 */
        .video-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        /* 视频播放图标 */
        .video-play-icon {
          position: absolute;
          bottom: 0;
          left: toRpx(36);
          transform: translate(-50%, -50%);
          width: toRpx(40);
          height: toRpx(40);
          background-color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
      }
      .no-bac {
        background-color: transparent;
        padding: 0;
      }
    }
  }
  .status-box {
    .label {
      color: #999ea8;
      font-size: toRpx(24);
      font-weight: 400;
    }
    .value {
      color: #666666;
      font-size: toRpx(24);
      font-weight: 400;
    }
  }
  .status {
    border-radius: toRpx(4);
    background: #fef4e8;
    padding: 0 toRpx(20);
    font-size: toRpx(24);
    font-weight: 500;
    height: toRpx(44);
    line-height: toRpx(44);
  }
  .bg-transparent {
    background-color: transparent !important;
    font-size: toRpx(28);
    font-weight: 500;
  }
  // 状态颜色
  .status-10 {
    color: #f59619;
    background: #fef4e8;
  }
  .status-20 {
    color: #6a56f0;
    background: #f0eefd;
  }
  .status-30 {
    color: #2cca74;
    background: #e9f9f1;
  }
  .status-31 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-32 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-40 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-50 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-100 {
    color: #2cca74;
    background: #e9f9f1;
  }
  // 驳回
  .status-0 {
    color: #eb4e4e;
    background: #fdeded;
  }
  .tableBox {
    width: 100%;
    border-radius: toRpx(16);
    overflow: hidden;
    box-sizing: border-box;
  }
  .tableHeader {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4rpx;
    background: #edf3ff;
    font-weight: bold;
    font-size: toRpx(28);
    color: #333333;
  }
  .tableHeader > view {
    font-size: toRpx(28);
    font-weight: 600;
    color: #333333;
    text-align: center;
    height: toRpx(88);
    line-height: toRpx(88);
  }
  .tableItem {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: toRpx(4);
    padding: toRpx(16) toRpx(20);
    box-sizing: border-box;
    border-bottom: 1px solid #f0f0f0;
  }
  .tableItem > view {
    font-size: toRpx(26);
    color: #666666;
    text-align: left;
  }
  .tableRow {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4rpx;
    margin-top: 4rpx; /* 添加行与行之间的间隔 */
  }
  .tableCell {
    padding: toRpx(20) toRpx(16);
    font-size: toRpx(28);
    color: #666666;
    background: #f9fafc;
    text-align: center;
    word-break: break-all;
    uni-image {
      width: toRpx(96);
      height: toRpx(96);
      border-radius: 8px;
    }
    .status {
      width: toRpx(124);
    }
  }
  .break-word {
    word-break: break-all;
    white-space: normal;
  }
  // 表格空状态样式
  .empty-table {
    padding: toRpx(60) 0;
    text-align: center;
    color: #999999;
    font-size: toRpx(28);
    background: #f9fafc;
  }
  .tableContent {
    border-radius: toRpx(16);
    opacity: 1;
    background: #ffffff;
    padding: toRpx(32);
    box-sizing: border-box;
  }
  .padBox {
    padding-left: toRpx(32);
    padding-right: toRpx(32);
  }
}
</style>
