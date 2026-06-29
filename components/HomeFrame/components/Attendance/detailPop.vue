<template>
	<uni-popup ref="popup" type="bottom" border-radius="toRpx(16)" :mask-click="false">
		<view :class="['kf-box', type]">
			<view class="title">
				<image class="attendance-title" :src="require('@/assets/images/point/attendance-title.png')"
					mode="scaleToFill" />
					<template v-if="type == 'record'"><view>{{ detailInfo.year }}年{{ detailInfo.month }}月{{ detailInfo.data.day }}日</view><view v-if="detailInfo.data.dayState == 3" class="purple">有请假</view></template>
					<template v-else-if="type == 'appeal'">{{ title }}</template>
				<view class="close flex" @click="close">
					<uni-icons type="closeempty" :size="18" color="#1A1A1A"></uni-icons>
				</view>
			</view>
			<template v-if="type == 'record'">
				<view class="timeline-container">
				<view class="timeline-item">
					<view class="timeline-dot"></view>
					<view class="timeline-content">
						<text class="time-label">上班</text>
						<view class="time-right">
							<view class="time-top">
								<text class="time">{{ detailInfo.data.clockInState == 3 ? '未打卡' : detailInfo.data.clockInTime }}</text>
								<!-- ABNORMAL_LIST.find(item => item.value == detailInfo.data.clockInState).class -->
								<text class="status" :class="[getClockInStateClass]">{{ CLOCK_STATE[detailInfo.data.clockInState] }}</text>
							</view>
							<view :class="['extra-info', clockInAbnormalAttire ? 'red':'']">{{clockInAbnormalAttire ? '着装异常':'着装正常'}}</view>
							<view v-if="abnormalAttire" class="clock-img">
								<template v-if="detailInfo.data.clockInPhotoUrl"><image class="dress-code" @click="openImg('上班', detailInfo.data.clockInPhotoUrl)" :src="detailInfo.data.clockInPhotoUrl" mode="scaleToFill" /></template>
								<template v-else>
									<view class="no-url">
										<view class="sprite-icon icon-no-picture"></view>
										暂无记录</view>
								</template>
							</view>
							
						</view>
					</view>
				</view>
				<view :class="['timeline-line', abnormalAttire ? 'bnormal' : 'normal']"></view>
				<view class="timeline-item">
					<view class="timeline-dot"></view>
					<view class="timeline-content">
						<text class="time-label">下班</text>
						<view class="time-right">
							<view class="time-top">
								<text class="time">{{ detailInfo.data.clockOutState == 3 ? '未打卡' : detailInfo.data.clockOutTime }}</text>
								<text class="status" :class="[getClockOutStateClass]">{{ CLOCK_STATE[detailInfo.data.clockOutState] }}</text>
							</view>
							<view :class="['extra-info', clockOutAbnormalAttire ? 'red':'']">{{clockOutAbnormalAttire ? '着装异常':'着装正常'}}</view>
							<view v-if="abnormalAttire" class="clock-img">
								<template v-if="detailInfo.data.clockOutPhotoUrl">
									<image class="dress-code" @click="openImg('下班', detailInfo.data.clockOutPhotoUrl)" :src="detailInfo.data.clockOutPhotoUrl" mode="scaleToFill" />
								</template>
								<template v-else>
									<view class="no-url">
										<view class="sprite-icon icon-no-picture"></view>
										暂无记录</view>
								</template>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="working-hours">
				<view class="sprite-icon icon-time"></view>
				工作时长：<text :class="[detailInfo.data.workTimeWarn ? 'missing-card':'']">{{detailInfo.data.workTime}}</text>
			</view>
			<!-- <template v-if="detailInfo.data.dayState != 1">
				<template v-if="value">
				<view class="submit-btn"><view class="sprite-icon icon-submit"></view>已提交申诉</view>
			</template>
			<template v-else>
				<view class="btn" @click="toAppeal">我要申诉</view>
			</template>
			</template> -->
			</template>
			<template v-else-if="type == 'appeal'">
				<view class="appeal-box">
					<view class="label">申诉日期：{{ detailInfo.year }}年{{ detailInfo.month }}月{{ detailInfo.data.day }}日</view>
					<view class="label">申诉说明：</view>
					<view style="position: relative;">
						<textarea :class="['textarea', isRequire?'red':'']" v-model="value" @blur="blur" placeholder-style="color: #C9C9C9" placeholder="请填写申诉说明，字数不超过200字" maxlength="200"></textarea>
						<view v-if="isRequire" class="error-tips">请填写申诉说明</view>
					</view>
				</view>
				<view class="btn appeal-btn" @click="handleAppeal">提交申诉</view>
			</template>
		</view>
		<preview ref="img" :isComponents="true" :show="showPreview" :mediaObject="mediaObject" @previewBack="previewBack"></preview>
	</uni-popup>

</template>

<script type='text/ecmascript-6'>
import preview from './preview.vue';
import {CLOCK_STATE, ABNORMAL_LIST} from './contant'
export default {
	name: 'detailPop',
	props: {
		detailInfo: Object
	},
	components: {preview},
	data() {
		return {
			dataInfo: {
				startTime: '09:00:21',
				endTime: '18:26:05',
				startStatus: true,
				endStatus: true
			},
			type: 'record',
			title: '考勤申诉',
			value: '',
			showPreview: false,
			mediaObject: {
				detailUrl: '',
				tabName: '',
				sourceType: 1
			},
			isRequire: false,
			CLOCK_STATE,
			ABNORMAL_LIST,
			isAppeal: false
		}
	},
	computed: {
		// 只要有一个异常就显示图片的
		abnormalAttire() {
			return this.detailInfo.data.clockInAbnormalAttire || this.detailInfo.data.clockOutAbnormalAttire 
		},
		clockInAbnormalAttire() {
			return this.detailInfo.data.clockInAbnormalAttire
		},
		clockOutAbnormalAttire() {
			return this.detailInfo.data.clockOutAbnormalAttire
		},
		getClockInStateClass() {
			switch(this.detailInfo.data.clockInState) {
				case 0:
					return 'normal'
				case 1:
					return 'late'
				case 2: 
					return 'late'
				case 3: 
					return 'missing-card'
			}
		},
		getClockOutStateClass() {
			switch(this.detailInfo.data.clockOutState) {
				case 0:
					return 'normal'
				case 1:
					return 'late'
				case 2: 
					return 'late'
				case 3: 
					return 'missing-card'
			}
		}
	},
	mounted() {
	},
	methods: {
		open() {
			console.log(this.detailInfo, '===')
			this.$refs.popup.open("center");
			this.value = this.detailInfo.data.appealContent
			this.isAppeal = false
		},
		close() {
			this.$refs.popup.close()
			this.$emit('close', this.isAppeal)
			this.isRequire = false
			// 弹窗动画结束后修改为默认值
			setTimeout(() => {
				this.type = 'record'
			}, 400)
		},
		toAppeal() {
			this.type = 'appeal'
		},
		async handleAppeal() {
			console.log(this.value)
			if (!this.value) {
				this.isRequire = true
			} else {
				this.isRequire = false
				const { phone } = uni.$storage.get("userInfo")
				const {detailInfo, value} = this
				const res = await uni.$api.pointApi.appealCommit({
					appealDate: `${detailInfo.year}-${detailInfo.month}-${detailInfo.data.day}`,
					appealDesc: value,
					staffPhone: phone,
					appealType: 1
				})
				if (res) {
					this.type = 'record'
					this.isAppeal = true
					uni.showToast({
						title: "提交成功",
						icon: "success",
					});
				}
			}
			
		},
		openImg(name, url) {
			// const url = 'https://img.ixintu.com/download/jpg/201911/e25b904bc42a74d7d77aed81e66d772c.jpg!con'
			this.mediaObject.detailUrl = url
			this.mediaObject.tabName = `${name}打卡`		
			this.showPreview = true
		},
		previewBack() {
			this.showPreview = false
		},
		blur() {
			this.isRequire = !this.value
		}
	}
}
</script>

<style scoped lang='scss'>
.kf-box {
	position: relative;
	background: #ffffff;
	border-radius: toRpx(48);
	// padding: 0 toRpx(48);
	box-sizing: border-box;
	background-image: url(@/assets/images/point/attendance-bg.webp);
	
	background-repeat: no-repeat;
	padding-bottom: toRpx(80);
	&.record {
		width: toRpx(1040);
		min-height: toRpx(654);
		background-size: toRpx(1040) toRpx(400);
	}
	&.appeal {
		width: toRpx(1456);
		height: toRpx(992);
		background-size: toRpx(1456) toRpx(400);
	}

	.close {
		margin-left: auto;
	}

	.title {
		display: flex;
		align-items: center;
		font-weight: 500;
		font-size: toRpx(40);
		padding: toRpx(40) toRpx(46);

		.attendance-title {
			width: toRpx(80);
			height: toRpx(80);
			margin-right: toRpx(16);
		}
		.purple {
			background-color: rgba(109, 88, 245, 0.1);
			border-radius: toRpx(12);
			padding: toRpx(6) toRpx(16);
			color: #6D58F5;
			font-size: toRpx(24);
			font-weight: 400;
			margin-left: toRpx(20);
		}
	}

	.message-bg {
		width: toRpx(1040);
		height: toRpx(400);
		border-radius: toRpx(48);
	}

	.btn {
		margin: toRpx(80) auto 0;
		width: toRpx(376);
		height: toRpx(88);
		border-radius: toRpx(16);
		background: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
		box-shadow: inset 0 0 toRpx(32) 0 #ffffff80;
		color: #ffffff;
		font-size: toRpx(36);
		font-weight: 500;
		text-align: center;
		line-height: toRpx(88);
	}
}

.timeline-container {
	position: relative;
	padding-left: toRpx(144);
}

.timeline-line {
	position: absolute;
	left: toRpx(236);
	top: toRpx(24);
	width: toRpx(4);
	background-color: #E6EAF0;

	&.normal {
		height: toRpx(142);
	}

	&.bnormal {
		height: toRpx(358);
	}
}

.timeline-item {
	position: relative;
	margin-bottom: toRpx(64);
}

.timeline-dot {
	position: absolute;
	left: toRpx(86);
	top: toRpx(20);
	transform: translateY(-50%);
	width: toRpx(16);
	height: toRpx(16);
	border: toRpx(4) solid #181A1F;
	border-radius: 50%;
	box-sizing: border-box;
	z-index: 11;
	flex-shrink: 0;
}

.timeline-content {
	display: flex;
}

.time-right {
	margin-left: toRpx(40);
	.time-top {
		display: flex;
		justify-content: center;
	}
	.clock-img {
		margin-top: toRpx(24);
		width: toRpx(144);
		height: toRpx(192);
		border-radius: toRpx(10);
		background-color: #F7F8FA;
		.no-url {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: toRpx(56);
			color: #B6BAC2;
			font-size: toRpx(24);
			.icon-no-picture {
				margin-bottom: toRpx(8);
			}
		}
	}
}

.time-label {
	margin-right: toRpx(24);
	color: #808291;
	font-size: toRpx(32);
}

.time {
	font-size: toRpx(32);
	color: #181A1F;
}

.status {
	margin-left: toRpx(24);
	padding: toRpx(6) toRpx(16);
	border-radius: toRpx(12);
	font-size: toRpx(24);

	&.normal {
		background-color: rgba(44, 202, 116, 0.1);
		color: #2cca74;
	}

	&.late {
		color: #F59619;
		background-color: rgba(245, 150, 25, 0.1);
	}

	&.missing-card {
		color: #EB4E4E;
		background-color: rgba(235, 78, 78, 0.1);
	}
}




.extra-info {
	margin-top: toRpx(16);
	color: #808291;
	font-size: toRpx(26);
	&.red {
		color: #EB4E4E;
	}
}

.dress-code {
	width: toRpx(144);
	height: toRpx(192);
	border-radius: toRpx(10);
}

.working-hours {
	display: flex;
	align-items: center;
	margin-left: toRpx(144);
	font-size: toRpx(32);

	.icon-time {
		margin-right: toRpx(16);
	}

	.missing-card {
		color: #EB4E4E;
	}
}
.submit-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: toRpx(80);
	color: #2cca74;
	font-size: toRpx(36);
	font-weight: 500;
	.icon-submit {
		margin-right: toRpx(12);
	}
}
.appeal-box {
	margin: 0 toRpx(144) 0;
	width: calc(100% - #{topx(288)});
	.label {
		color: #181a1f;
 		font-size: toRpx(32);
		line-height: toRpx(48);
		&:first-child {
			margin-bottom: toRpx(32);
		}
	}
	.textarea {
		width: toRpx(1168);
		height: toRpx(488);
		border-radius: toRpx(20);
		border: toRpx(2) solid #e8e8e8;
		background: #ffffff;
		margin-top: toRpx(16);
		padding: toRpx(20) toRpx(24);
		&.red {
			border-color: #EB4E4E;
		}
	}
	.error-tips {
		position: absolute;
		bottom: toRpx(-20);
		transform: translateY(100%);
		left: 0;
		color: #EB4E4E;
	}
}
.btn.appeal-btn {
	margin-top: toRpx(48);
}
</style>