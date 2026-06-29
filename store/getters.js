export default {
  token: (state) => state.user.token,
  siteData: (state) => state.site.siteData,
  userData: (state) => state.user.userData,
  userId: (state) => state.user.userData.id,
  isInBackgound: (state) => state.sys.isInBackgound,
  customerInfo: (state) => state.user.customerInfo,
  receptionTrack: (state) => state.user.receptionTrack,
  receptionStatus: (state) => state.audio.receptionStatus,
  booksList: (state) => state.audio.booksList,
  receptionKey: (state) => state.user.receptionKey,
  customerKey: (state) => state.user.customerKey,
  activityWindowPopStatus: (state) => state.sys.activityWindowPopStatus
};
