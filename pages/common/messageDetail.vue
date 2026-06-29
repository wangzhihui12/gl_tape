<template>
	<view class="detail-box">
		<view class="nav-bar">
			<view v-if="messageInfo.status == 1" class="back" @click="backArrow">
				<uni-icons type="left" :size="20" color="#000"></uni-icons>
			</view>
			<view class="title">优秀话术-{{ messageInfo.sceneLabelName }}</view>
		</view>
		<view class="weekly-tips">
			<view :class="['outstanding-tip-item', messageInfo.status == 1 ? 'single' : 'read']">
				<view class="tip-header">
					<!-- <view class="tip-rank">优秀话术-{{ messageInfo.className }}</view> -->
					<view class="tip-time">{{ messageInfo.time }}</view>
					<view v-if="messageInfo.excellentLabelName" class="tip-tags">{{ messageInfo.excellentLabelName }}</view>
				</view>
				<view class="tip-content">
					{{ messageInfo.polishContent }}
				</view>
			</view>
			<view class="detail-footer">
				<template v-if="messageInfo.status == 0">
					<view class="tips">以上内容请认真阅读，至少读完{{ countTime }}分钟，如未按照要求阅读完内容，今日无法使用pad接待</view>
					<view :class="['btn', !countFlag ? '' : 'blue']" @click="handleCompleted">已完成阅读 {{ !countFlag ?
						`${countdown}s` :
						'' }}</view>
				</template>
				<template v-if="pageType == 'service' && messageInfo.status == 1">
					<view class="btn blue more-script" @click="handleMoreScript">更多话术</view>
				</template>
			</view>
		</view>
	</view>
</template>
<script>
let timer = null
let countTimer = 1
import dayjs from 'dayjs'
export default {
	name: 'MessageDetail',
	data() {
		return {
			recordDetailList: [],
			classCountList: [],
			countdown: 5,
			countFlag: false,
			messageInfo: {},
			tagIndex: '',
			enterTime: '',
			isProcessing: false,
			MOCKDATA: {},
			countTime: 0,
			pageType: ''
		}
	},
	computed: {
		onlyOneLength() {
			return this.recordDetailList.length == 1
		},
	},
	created() {
		// 获取mock配置的时间
		this.MOCKDATA = uni.$storage.get('mock_data')
		this.countTime = this.MOCKDATA.timer || countTimer
		// this.countTime = 0.1
		this.countdown = this.countTime * 60 - 1
	},
	onLoad(options) {
		console.log(options)
		const { row } = options
		// 开始倒计时
		this.startCountdown()
		// 进入埋点的时间
		this.enterTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
		this.messageInfo = JSON.parse(row)
		this.pageType = options.type
	},
	beforeDestroy() {
		if (timer) {
			clearInterval(timer);
		}
	},
	// inject: ['showPage'],
	methods: {
		async backArrow() {
			const idList = [this.messageInfo.scriptId]
			// 埋点
			await uni.$api.commonApi.extractExcellent({
				scriptIdList: idList,
				startTime: this.enterTime,
				endTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
			})
			uni.navigateBack({
				delta: 1,
				animationType: 'pop-out',
				animationDuration: 100
			})
		},
		// 返回
		// back(idList = null) {
		// 	console.log(idList)
		// 	// this.showPage(name, obj)
		// 	// if (idList) uni.$emit('pageList', idList[0]);
		// 	uni.navigateBack({
		// 		delta: 1,
		// 		animationType: 'pop-out',
		// 		animationDuration: 100
		// 	})
		// },
		async backPage(scriptId = null, ids = null) {
			let idList = scriptId
			if (!idList) {
				idList = [this.messageInfo.scriptId];
			}
			// 埋点
			await uni.$api.commonApi.extractExcellent({
				scriptIdList: idList,
				startTime: this.enterTime,
				endTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
			})
			// if (ids) {
			// 	this.back(ids)
			// } else {
			uni.redirectTo({
				url: '/pages/common/messageList'
			});
			// }
			// if (type == 'read') this.$emit("backHome")
			// else if (type == 'view') this.back('MessageList', {firstIndex: 1})
			// this.back('MessageList', {firstIndex: 1, tagIndex: this.tagIndex})
		},
		// 开始倒计时
		startCountdown() {
			timer = setInterval(() => {
				if (this.countdown > 0) {
					this.countdown--;
				} else {
					this.countFlag = true
					clearInterval(timer);
				}
			}, 1000);
		},
		// 点击已完成按钮
		async handleCompleted() {
			if (this.isProcessing) return;
			console.log(this.countFlag)
			let scriptId = null
			if (this.countFlag) {
				let idList
				idList = [this.messageInfo.id];
				scriptId = [this.messageInfo.scriptId]
				try {
					this.isProcessing = true;
					// 接口调用
					const res = await uni.$api.commonApi.updateMessageStatus({
						idList
					})
				} catch (error) {
					// this.backPage(scriptId, idList)
					console.error('更新消息状态时出现错误:', error)
				} finally {
					this.isProcessing = false; // 处理完成，将标志位设为 false
					this.backPage(scriptId)
				}
			}
		},
		handleMoreScript() {
			uni.redirectTo({
				url: '/pages/common/messageList?type=more',
				fail: (err) => {
					console.error('页面跳转失败:', err);
				}
			});
		}
	}
}
</script>

<style scoped lang="scss">
.detail-box {
	position: relative;
	width: 100vw;
	height: 100vh;
	background-image: url('@/assets/images/common/page-bg.webp');
	background-size: 100%;
	box-sizing: border-box;
	padding-top: toRpx(160);
}

.nav-bar {
	position: fixed;
	width: 100%;
	height: toRpx(96);
	left: 0;
	top: toRpx(48);
	z-index: 999;
	pointer-events: none;

	.back {
		height: 100%;
		aspect-ratio: 1/1;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
	}

	.title {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-weight: 700;
		font-size: toRpx(32);
		color: #1a1a1a;
	}
}

.weekly-tips {
	position: relative;
	margin: 0 toRpx(64) toRpx(80);
	background-color: rgba(255, 255, 255, 0.35);
	border: toRpx(4) solid #fff;
	border-radius: toRpx(48);
	height: calc(100% - #{toRpx(80)});
	padding-top: toRpx(40);

	.tips-title {
		display: flex;
		font-size: toRpx(36);
		font-weight: 500;
		padding: 0 toRpx(64) toRpx(40);

		.tips-tags {
			display: flex;
			color: #4673FF;

			.tags-separator {
				margin: 0 toRpx(10);
			}
		}
	}

	.outstanding-tip-list {
		height: calc(100% - #{toRpx(348)});
	}

	.outstanding-tip-item {
		width: calc(100% - #{toRpx(128)});
		padding: toRpx(24) toRpx(32);
		border-radius: toRpx(16);
		background-color: #fff;
		margin: 0 toRpx(64) toRpx(40);

		&.long {
			height: 100%;
		}

		&.single {
			height: calc(100% - #{toRpx(40)});
		}

		&.read {
			height: calc(100% - #{toRpx(216)});
		}

		.tip-header {
			display: flex;
			align-items: center;

			.tip-rank {
				color: #333;
				font-size: toRpx(32);
				font-weight: 500;
				line-height: toRpx(44);
				margin-right: toRpx(24);
			}

			.tip-time {
				color: rgba(102, 102, 102, 0.6);
				font-size: toRpx(28);
				line-height: toRpx(44);
			}

			.tip-tags {
				border-radius: toRpx(4);
				background: rgba(255, 157, 10, 0.1);
				padding: toRpx(8) toRpx(24);
				color: #ff9d0a;
				font-size: toRpx(24);
				font-weight: 500;
				margin-left: toRpx(24);
			}
		}

		.tip-content {
			margin-top: toRpx(17);
			color: #666;
			font-size: toRpx(28);
			line-height: toRpx(48);
		}
	}

	.detail-footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: toRpx(32);
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
	}

	.tips {
		color: #ff9d0a;
		font-size: toRpx(32);
		margin-bottom: toRpx(32);
	}

	.btn {
		width: toRpx(720);
		height: toRpx(80);
		border-radius: toRpx(48);
		opacity: 0.4;
		border: toRpx(2) solid #979797;
		background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
		color: #fff;
		font-size: toRpx(32);
		line-height: toRpx(80);
		text-align: center;
		opacity: 0.4;

		&.blue {
			opacity: 1;
		}
	}

	.more-script {
		margin-bottom: toRpx(48);
	}
}
</style>