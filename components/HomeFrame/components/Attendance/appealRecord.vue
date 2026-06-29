<template>
	<uni-popup ref="popup" type="bottom" border-radius="16px" :mask-click="false">
		<view class="kf-box">
			<view class="title">
				<image class="attendance-title" :src="require('@/assets/images/point/attendance-title.png')"
					mode="scaleToFill" />
				<view>考勤申诉记录</view>
				<view class="close flex" @click="close">
					<uni-icons type="closeempty" :size="18" color="#1A1A1A"></uni-icons>
				</view>
			</view>
      <view class="table-container">
        <table class="table-box">
          <tr class="th">
            <th v-for="(item, index) in tabelTh" :key="index" :style="{ width: item.width + '%' }">{{ item.title }}</th>
          </tr>
          <tr class="tr" v-for="(item, index) in recordList" :key="index">
            <td v-if="tabelTh[0].title == '序号'">{{ index + 1 }}</td>
            <td v-for="(colValue, colKey) in tabelTr" :key="colKey">
              <text class="car-box" v-if="colValue.style" :style="colValue.style(item[colValue.type])">{{ colValue.text(item[colValue.type]) }}</text>
              {{ colValue.format ? colValue.format(item[colValue.key]) : colValue.name ? colValue.name(item) : item[colValue] }}
            </td>
          </tr>
        </table>
      </view>
		</view>
	</uni-popup>

</template>

<script type='text/ecmascript-6'>
export default {
	name: 'AppealRecord',
	props: {
    recordList: Array
	},
	data() {
		return {
      tabelTh: [{
        title: '申诉日期',
        width: 20
      },
      {
        title: '申诉说明'
      }],
      tabelTr: [
        'appealDate',
        'appealDesc'
      ],
      detail: {
        recordList: [
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: 400
          // },
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: 400
          // },
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: '当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理'
          // },
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: '当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理'
          // },
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: '当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理'
          // },
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: '当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理'
          // },
          // {
          //   appealDate: "2025-04-10",
          //   appealDesc: '当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理，当天准时到岗，但因紧急接待客户衣服还没来得及更换，请求特殊处理'
          // }
        ]
      }
		}
	},
	mounted() {
	},
	methods: {
		open() {
			this.$refs.popup.open("center");
		},
		close() {
			this.$refs.popup.close()
		},
	}
}
</script>

<style scoped lang='scss'>
.kf-box {
	position: relative;
	width: toRpx(1608);
	min-height: toRpx(654);
	background: #ffffff;
	border-radius: toRpx(48);
	// padding: 0 toRpx(48);
	box-sizing: border-box;
	// background-image: url(@/assets/images/point/attendance-bg.png);
	background-size: toRpx(1040) toRpx(400);
	background-repeat: no-repeat;
	padding-bottom: toRpx(80);

	.close {
		margin-left: auto;
	}

	.title {
		display: flex;
		align-items: center;
		font-weight: 500;
		font-size: toRpx(40);
		padding: toRpx(40) toRpx(46);
    background: linear-gradient(180deg, #d6e6ff 0%, #ffffff00 100%);
    border-radius: toRpx(48) toRpx(48) 0 0;

		.attendance-title {
			width: toRpx(80);
			height: toRpx(80);
			margin-right: toRpx(16);
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
		box-shadow: inset 0 0 32px 0 #ffffff80;
		color: #ffffff;
		font-size: toRpx(36);
		font-weight: 500;
		text-align: center;
		line-height: toRpx(88);
	}
}
.table-container {
  max-height: 50vh;
  overflow: auto;
}
.table-box {
  width: 100%;
  padding: 0 toRpx(64);
  border-collapse: separate;
  /* 防止边框合并 */
  border-spacing: 0;
  border: none;

  .th {
    position: sticky;
    top: 0;
  }
  /* 单元格之间没有间距 */
  tr {
    border: none;
    text-align: center;
    

    &.line {
      td {
        border-top: toRpx(16) solid rgba($color: #fff, $alpha: 0.9);
      }
    }

    th {
      border: toRpx(4) solid #fff;
      /* 所有单元格都有边框 */
      border-top: none;
      /* 除了首行外，所有行的上方无边框 */
      background: #edf2ff;
      height: toRpx(88);
      font-size: toRpx(26);
      box-sizing: border-box;
      color: #333333;

      &:first-child {
        border-left: none;
        border-radius: toRpx(16) 0 0 0;
      }

      &:last-child {
        border-right: none;
        border-radius: 0 toRpx(16) 0 0;
        // text-align: right;
        // padding-right: toRpx(48);
      }
    }

    td {
      .car-box {
        padding: toRpx(4);
        font-size: toRpx(24);
        border-radius: toRpx(4);
        margin-right: toRpx(6);
      }
      border: toRpx(4) solid #fff;
      /* 所有单元格都有边框 */
      border-top: none;
      /* 除了首行外，所有行的上方无边框 */
      background: #f7f8fa;
      height: toRpx(88);
      font-size: toRpx(26);
      color: #333333;
      text-align: center;
      box-sizing: border-box;
      padding: toRpx(28) toRpx(48);
      &:last-child {
        text-align: left;
        padding-right: toRpx(48);
      }
      text {
        color: #c8c8cc;
      }
      &.line {
        border-bottom: toRpx(16) solid #fff;
      }

      &:first-child {
        border-left: none;
      }

      &:last-child {
        border-right: none;
      }
    }
    &:last-child {
      td {
        &:first-child {
          border-radius: 0 0 0 toRpx(16);
        }
        &:last-child {
          border-radius: 0 0 toRpx(16) 0;
        }
      }
    }
  }
}
</style>