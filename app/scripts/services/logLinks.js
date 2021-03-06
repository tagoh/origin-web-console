'use strict';

angular.module('openshiftConsole')
  .factory('logLinks', [
    '$anchorScroll',
    '$document',
    '$location',
    '$window',
    function($anchorScroll, $document, $location, $window) {
      // TODO (bpeterse): a lot of these functions are generic and could be moved/renamed to
      // a navigation oriented service.


      var scrollTop = function(node) {
        if(!node) {
          window.scrollTo(null, 0);
        } else {
          node.scrollTop = 0;
        }
      };


      var scrollBottom = function(node) {
        if(!node) {
          window.scrollTo(0, document.body.scrollHeight - document.body.clientHeight);
        } else {
          node.scrollTop = node.scrollHeight;
        }
      };


      var scrollTo = function(anchor, event) {
        // sad face. stop reloading the page!!!!
        event.preventDefault();
        event.stopPropagation();
        $location.hash(anchor);
        $anchorScroll(anchor);
      };


      // @params an object or array of objects
      var newTab = function(params) {
        params = _.flatten([params]);
        var uri = new URI();
        _.each(params, function(param) {
          uri.addSearch(param);
        });
        $window.open(uri.toString(), '_blank');
      };

      // new tab: path/to/current?view=chromeless
      var chromelessLink = function(options) {
        var params = {
          view: 'chromeless'
        };
        if (options && options.container) {
          params.container = options.container;
        }
        newTab(params);
      };

      // broken up for readability:
      var template = _.template([
        "/#/discover?",
        "_g=(",
          "time:(",
            "from:now-1w,",
            "mode:relative,",
            "to:now",
          ")",
        ")",
        "&_a=(",
          //"columns:!(_source),",
          "columns:!(kubernetes_container_name,<%= containername %>),", 
          "index:'<%= namespace %>.*',",
          "query:(",
            "query_string:(",
              "analyze_wildcard:!t,",
              "query:'kubernetes_pod_name: <%= podname %> %26%26 kubernetes_namespace_name: <%= namespace %>'",
            ")",
          "),",
          "sort:!(time,desc)",
        ")",
        // NOTE: slightly older versions of kibana require openshift_ prefix, not console_
        "#console_container_name=<%= containername %>",
        // backlink should be encoded.  passing URI.encode(backlink) should be sufficient
        "&console_back_url=<%= backlink %>"
      ].join(''));


      var archiveUri = function(opts) {
        return template(opts);
      };

      return {
        scrollTop: scrollTop,
        scrollBottom: scrollBottom,
        scrollTo: scrollTo,
        newTab: newTab,
        chromelessLink: chromelessLink,
        archiveUri: archiveUri
      };
    }
  ]);
