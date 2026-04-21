const GPC_CONFIG = {
  formId: "fe7532e0-3ef9-476a-9ea6-19d94c70a58b",
  gpcDetection: true,
  gpcConfig: {
    showFormForUnsubmittedDSR: true,
    geoLocationCodes: [],
  },
};

export function loadGPCScript() {
  const script = document.createElement("script");
  script.innerHTML = `
    !(function () {
      "use strict";
      var t = document.createElement("script");
      t.src = "https://form-renderer.trustarc.com/browser/client.js";
      t.type = "text/javascript";
      t.defer = true;
      document.body.appendChild(t);
      window.trustarc = window.trustarc || {};
      var r = window.trustarc;
      r.irm = [];
      for (
        var n = ["init", "destroy", "shouldShowGPCBanner", "setGPCSubmitted"],
          e = 0;
        e < n.length;
        e++
      ) {
        var o = n[e];
        r.irm[o] =
          r.irm[o] ||
          (function (t) {
            return function () {
              var n = Array.prototype.slice.call(arguments);
              r.irm.push([t, n]);
            };
          })(o);
      }
      r.irm.init(${JSON.stringify(GPC_CONFIG)});
    })();
  `;
  document.body.appendChild(script);
}

export function reinitGPC() {
  if (window.trustarc?.irm?.destroy) {
    window.trustarc.irm.destroy();
  }
  if (window.trustarc?.irm?.init) {
    window.trustarc.irm.init(GPC_CONFIG);
  }
}
