const requestStorageAccess = (site: string, prefix = '/') => {
  return `(function() {
      function redirect() {
        var targetInfo = {
          mythingsfactoryUrl: "https://${encodeURIComponent(site)}",
          hasStorageAccessUrl: "${prefix}auth/inline?site=${encodeURIComponent(site)}",
          doesNotHaveStorageAccessUrl: "${prefix}auth/enable_cookies?site=${encodeURIComponent(site)}",
          appTargetUrl: "${prefix}?site=${encodeURIComponent(site)}"
        }

        if (window.top == window.self) {
          // If the current window is the 'parent', change the URL by setting location.href
          window.top.location.href = targetInfo.hasStorageAccessUrl;
        } else {
          var storageAccessHelper = new StorageAccessHelper(targetInfo);
          storageAccessHelper.execute();
        }
      }

      document.addEventListener("DOMContentLoaded", redirect);
    })();`
}

export default requestStorageAccess
