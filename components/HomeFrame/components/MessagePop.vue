<template>
	<uni-popup ref="popup" type="bottom" border-radius="16px" :mask-click="false">
		<view class="kf-box" :class="{'system-height': type=='system'}">
			<template v-if="type=='attendance'">
				<image class="message-bg" :src="require('@//assets/images/common/message-bg.webp')"></image>
				<view class="text text-first">本周优秀话术推送</view>
				<view class="text">你有{{messageData.total}}条消息待查看</view>
				<view class="btn" @click="toMessage">去查看</view>
			</template>
			<!-- 当前有 3 个学习任务待完成，请及时处理。
坚持学习助您能力提升！ -->
			<template v-else-if="type=='study'">
				<image class="study-bg" :src="require('@//assets/images/common/study-center-bg.webp')"></image>
				<view class="text text-first study-title">学习提醒</view>
				<view class="text study-text">当前有{{messageData.count}}个学习任务待完成，请及时处理。</view>
				<view class="text study-text">坚持学习助您能力提升！</view>
				<view class="btn study-btn" @click="jumpStudyCenter">去查看</view>
			</template>
			<template v-else-if="type=='caseStudy'">
				<image class="study-bg" :src="require('@//assets/images/common/study-center-bg.webp')"></image>
				<view class="text text-first study-title">学习提醒</view>
				<view class="text study-text" v-if="messageData.reminderType == 1">您有新的长课程学习任务：{{messageData.msgTitle}}，请及时完成。</view>
				<view class="text study-text" v-if="messageData.reminderType == 2">您有未完成学习任务：{{messageData.msgTitle}}即将到期，抓紧时间完成哦！</view>
				<view class="btn study-btn" @click="jumpCaseStudy">去学习</view>
			</template>
			<template v-else-if="type=='caseShare'">
				<image class="study-bg" :src="require('@//assets/images/common/case-notice.webp')"></image>
				<view class="text text-first study-title">学习提醒</view>
				<view class="text study-text" v-if="messageData.reminderType == 1">您有新的优秀案例学习任务：{{messageData.msgTitle}}，请及时完成。</view>
				<view class="text study-text" v-if="messageData.reminderType == 2">您有未完成学习任务：{{messageData.msgTitle}}即将到期，抓紧时间完成哦！</view>
				<view class="btn study-btn" @click="jumpCaseShare">去学习</view>
			</template>
			<template v-else-if="type=='system'">
				<image class="message-bg" :src="require('@//assets/images/common/system-bg.webp')"></image>
				<view class="text text-first study-title">系统消息</view>
				<view class="text study-text">
					您有新的消息【
					{{ messageData.title && messageData.title.length > 8 ? messageData.title.slice(0, 8) + '...' : messageData.title }}
					】，请点击查看
				</view>
				<view class="text study-text"></view>
				<view class="btn study-btn" @click="jumpSystem">去查看</view>
			</template>
		</view>
	</uni-popup>

</template>

<script type='text/ecmascript-6'>
export default {
	name: 'MessagePop',
	props: {
		messageData: Object,
		type: String,
	},
	data() {
		return {
		}
	},
	inject: ['showPage'],
	mounted() {
	},
	methods: {
		open() {
			this.$refs.popup.open("center");
		},
		close() {
			this.$refs.popup.close()
			this.$emit('close')
		},
		toMessage() {
			const {messageData} = this
			this.showPage('MessageDetail', {...messageData, type: 'read'})
			this.close()
		},
		jumpStudyCenter() {
			uni.$emit('studyCenter')
			this.close()
		},
		// 跳转具体的长课程学习任务详情
		jumpCaseStudy() {
			console.log(this.messageData)
			// uni.$emit('caseStudy')
			this.close()
			uni.navigateTo({
				url: `/pages/common/studyDetail/caseCourse?id=${this.messageData.id}`
			})
		},
		// 跳转优秀案例详情
		jumpCaseShare() {
			console.log(this.messageData)
			// uni.$emit('caseShare')
			this.close()
			uni.navigateTo({
				url: `/pages/common/caseDetail/index?id=${this.messageData.id}`
			})
		},
		jumpSystem() {
			try {
				if(this.messageData.businessIds) this.getDetailById(this.messageData.businessIds[0])
				if(this.messageData.ids) {
					this.getCaseDetailById(this.messageData.ids[0])
				}
			} catch (e) {
				uni.showToast({
					title: '系统消息跳转失败',
					icon: 'none'
				})
				this.close()
				throw e
			}
			this.close()
		},
		async getCaseDetailById(id) {
			const res = await uni.$api.commonApi.getBoxDetail({ id })
      this.handleNavigation(res.msgDetail)
		},
		async getDetailById(id) {
      const res = await uni.$api.commonApi.getTaskById({ id })
      this.handleNavigation(res)
    },
    handleNavigation(data) {
      const _row = encodeURIComponent(JSON.stringify(data))
      const { contentType, content, title, id } = data
      
      if (contentType == 1) {
        uni.navigateTo({
          url: `/pages/common/systemDetail?row=${_row}`
        })
      } else if (contentType == 2) {
        const _content = content ? JSON.parse(content) : []
        const url = _content[0]
        uni.navigateTo({
          url: `/pages/common/imgPreview?tabName=${title}&sourceType=2&detailUrl=${url}&row=${_row}`
        })
      } else if (contentType == 3) {
        const _content = content ? JSON.parse(content) : []
        const url = _content[0]?.image || ''
        uni.navigateTo({
          url: `/pages/common/msgwebview?fileUrl=${url}&title=${title}&id=${id}&row=${_row}`
        })
      }
    },
	}
}
</script>

<style scoped lang='scss'>
.kf-box {
	position: relative;
	width: toRpx(848);
	padding-bottom: toRpx(1);
	// height: toRpx(720);
	background: #ffffff;
	border-radius: toRpx(48);
	// padding: 0 toRpx(48);
	box-sizing: border-box;
	// &.system-height {
	// 	height: toRpx(664);
	// }

	.message-bg {
		width: toRpx(848);
		height: toRpx(346);
		border-radius: toRpx(48);
	}
	.study-bg{
		width: toRpx(848);
		height: toRpx(248);
		border-radius: toRpx(48);
	}
	.text {
		text-align: center;
		color: #333333;
 		font-size: toRpx(32);
		line-height: toRpx(64);
		&.text-first {
			margin-top: toRpx(40);
			margin-bottom: toRpx(16);
		}
		&.study-text {
			line-height: toRpx(48);
			padding: 0 toRpx(64);
			word-break: break-all;
		}
		&.study-title {
			font-weight: 500;
			font-size: toRpx(40);
			margin-top: toRpx(30);
		}
	}
	.btn {
		margin: toRpx(70) auto;
		width: toRpx(784);
		height: toRpx(80);
		border-radius: toRpx(48);
		opacity: 1;
		background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
		color: #ffffff;
		font-size: toRpx(28);
		font-weight: 500;
		text-align: center;
		line-height: toRpx(80);
		&.study-btn {
			margin: toRpx(48) auto;
		}
	}
}
</style>