<template>
	<view class="detail-box">
		<view class="nav-bar">
			<!-- <view v-if="type == 'view' && messageInfo.status == 1" class="back" @click="backPage">
				<uni-icons type="left" :size="20" color="#000"></uni-icons>
			</view> -->
			<view class="title">消息</view>
		</view>
		<view class="weekly-tips">
			<view class="tips-title" v-if="type == 'read'">本周优秀话术：
				<view class="tips-tags">
					<template v-for="(i, idx) in classCountList">
						<view>{{ i.className }}</view>
						<view v-if="i.count > 1">*{{ i.count }}</view>
						<view class="tags-separator" v-if="classCountList.length - 1 != idx"> | </view>
					</template>
				</view>
			</view>
			<!-- <template v-if="type == 'read'"> -->
				<scroll-view scroll-y class="outstanding-tip-list">
					<view :class="['outstanding-tip-item', onlyOneLength ? 'long' : 'short']"
						v-for="(item, index) in recordDetailList" :key="item.id">
						<view class="tip-header">
							<view class="tip-rank">{{ onlyOneLength ? '' : `NO.${index + 1}` }} 优秀话术-{{ item.sceneLabelName }}</view>
							<view class="tip-time">{{ item.time }}</view>
							<view v-if="item.excellentLabelName" class="tip-tags">{{ item.excellentLabelName }}</view>
						</view>
						<view class="tip-content">
							{{ item.polishContent }}
						</view>
					</view>
				</scroll-view>
				<view class="detail-footer">
					<view class="tips">以上内容请认真阅读，至少读完{{countTime}}分钟，如未按照要求阅读完内容，今日无法使用pad接待</view>
					<view :class="['btn', !countFlag ? '' : 'blue']" @click="handleCompleted">已完成阅读 {{ !countFlag ?
						`${countdown}s` :
						'' }}</view>
				</view>
			<!-- </template> -->
			<!-- <template v-else-if="type == 'view'">
				<view :class="['outstanding-tip-item', messageInfo.status == 1 ? 'single' : 'read' ]">
					<view class="tip-header">
						<view class="tip-rank">优秀话术-{{ messageInfo.className }}</view>
						<view class="tip-time">{{ messageInfo.time }}</view>
						<view class="tip-tags">{{ messageInfo.className }}</view>
					</view>
					<view class="tip-content">
						{{ messageInfo.polishContent }}
					</view>
				</view>
				<view class="detail-footer" v-if="messageInfo.status == 0">
					<view class="tips">以上内容请认真阅读，至少读完{{countTime}}分钟，如未按照要求阅读完内容，今日无法使用pad接待</view>
					<view :class="['btn', !countFlag ? '' : 'blue']" @click="handleCompleted">已完成阅读 {{ !countFlag ?
						`${countdown}s` :
						'' }}</view>
				</view>
			</template> -->
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
			type: 'view',
			tagIndex: '',
			enterTime: '',
			isProcessing: false,
			MOCKDATA: {},
			countTime: 0
		}
	},
	props: {
		transfer: {
			type: Object,
			default: () => { }
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
		this.countdown = this.countTime * 60 - 1
	},
	mounted() {
		// 开始倒计时
		this.startCountdown()
		// 进入事件的买点
		this.enterTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
		const { type, row, tagIndex, classCountList, recordDetailList } = this.transfer || {}
		if (type == 'view') {
			this.messageInfo = row
			this.type = type
			this.tagIndex = tagIndex
		} else if (type == 'read') {
			this.type = type
			this.classCountList = classCountList
			recordDetailList.map(e => {
				e.time = dayjs(new Date(e.pushTime)).format("YYYY-MM-DD HH:mm:ss")
			})
			this.recordDetailList = recordDetailList
			console.log(this.classCountList)
		}
	},
	beforeDestroy() {
		if (timer) {
			clearInterval(timer);
		}
	},
	// inject: ['showPage'],
	methods: {
		async backPage() {
			const {type} = this
			let idList
			if(type == 'read') idList = this.recordDetailList.map(item => item.scriptId);
			else if (type == 'view') idList = [this.messageInfo.scriptId];
			try {
				// 埋点
				const result = await uni.$api.commonApi.extractExcellent({
					scriptIdList: idList,
					startTime: this.enterTime,
					endTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
				})
				this.back()
			} catch (error) {
				console.log(error)
				this.back()
			}
		},
		back() {
			uni.navigateTo({
        url: `/pages/common/messageList?type=read`
      })
			this.$emit("backHome")
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
			if (this.countFlag) {
				try {
					this.isProcessing = true;
					let idList
					if(this.type == 'read') idList = this.recordDetailList.map(item => item.id);
					else if (this.type == 'view') idList = [this.messageInfo.id];
					// 接口调用
					const res = await uni.$api.commonApi.updateMessageStatus({
						idList
					})
				} catch (error) {
					console.error('更新消息状态时出现错误:', error)
				} finally {
					this.isProcessing = false; // 处理完成，将标志位设为 false
					this.backPage()
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.detail-box {
	position: relative;
	width: 100vw;
	height: 100vh;
	margin: 0 auto;
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
	margin: toRpx(156) toRpx(64) toRpx(80);
	background-color: rgba(255, 255, 255, 0.35);
	border: toRpx(4) solid #fff;
	border-radius: toRpx(48);
	height: calc(100% - #{toRpx(236)});
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
			}

			.tip-time {
				color: rgba(102, 102, 102, 0.6);
				font-size: toRpx(28);
				line-height: toRpx(44);
				margin-left: toRpx(24);
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
}
</style>