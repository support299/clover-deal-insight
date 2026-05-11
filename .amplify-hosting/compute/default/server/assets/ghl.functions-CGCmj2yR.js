import * as React from "react";
import { useRouter, isRedirect } from "@tanstack/react-router";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const exchangeGhlCode = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("cf66e0084f68315305cb63825d118ff860128571dd7c37f13f9cc488d8655c85"));
const refreshGhlToken = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("189a8e1a197b865bc628d564abdc47fb6b699a34d9d6ec33f13324bf218cc802"));
const updateGhlContactFromSale = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("0227cd0790cabff9584d6749d24a9de39bac3ab0a8ff73128fff418ae5db8485"));
const getGhlStatus = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("669663200fb0986f329d48422aa658af80d2d26ce8d27b9945e49f5b6b8b8ee7"));
export {
  updateGhlContactFromSale as a,
  exchangeGhlCode as e,
  getGhlStatus as g,
  refreshGhlToken as r,
  useServerFn as u
};
