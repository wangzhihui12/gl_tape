import * as Sentry from "./sentry-miniapp";
export default function sentryInit() {
  Sentry.init({
    // dsn: 'http://ebcf31c417cc4ce185782f046e4a87a2@sentry.glsx.com.cn/5'
    dsn: "https://cce6491788ff4b8899d8f912e6982a96@sentry.glsx.com.cn/42",
  });
  return Sentry;
}
