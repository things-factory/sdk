const requestStorageAccess = (warehouse: string, prefix = '/') => {
  return `(function() {
      function redirect() {
        var targetInfo = {
          mythingsfactoryUrl: "https://${encodeURIComponent(warehouse)}",
          hasStorageAccessUrl: "${prefix}auth/inline?warehouse=${encodeURIComponent(warehouse)}",
          doesNotHaveStorageAccessUrl: "${prefix}auth/enable_cookies?warehouse=${encodeURIComponent(warehouse)}",
          appTargetUrl: "${prefix}?warehouse=${encodeURIComponent(warehouse)}"
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
