const topLevelInteraction = (warehouse: string, prefix = '') => {
  return `(function() {
      function setUpTopLevelInteraction() {
        var TopLevelInteraction = new ITPHelper({
          redirectUrl: "${prefix}/auth?warehouse=${encodeURIComponent(warehouse)}",
        });

        TopLevelInteraction.execute();
      }

      document.addEventListener("DOMContentLoaded", setUpTopLevelInteraction);
    })();`
}

export default topLevelInteraction
