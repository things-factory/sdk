const topLevelInteraction = (site: string, prefix = '') => {
  return `(function() {
      function setUpTopLevelInteraction() {
        var TopLevelInteraction = new ITPHelper({
          redirectUrl: "${prefix}/auth?site=${encodeURIComponent(site)}",
        });

        TopLevelInteraction.execute();
      }

      document.addEventListener("DOMContentLoaded", setUpTopLevelInteraction);
    })();`
}

export default topLevelInteraction
