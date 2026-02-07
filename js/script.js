$(function () {
  $("#navbarToggle").blur(function () {
    if (window.innerWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });
});

(function (global) {
  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Insert HTML
  function insertHtml(selector, html) {
    var targetElem = document.querySelector(selector);
    if (targetElem) {
      targetElem.innerHTML = html;
    }
  }

  function showLoading(selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  }

  function insertProperty(string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    return string.replace(new RegExp(propToReplace, "g"), propValue);
  }

  function switchMenuToActive() {
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(/active/g, "");
    document.querySelector("#navHomeButton").className = classes;

    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowHomeHTML,
      true
    );
  });

  function buildAndShowHomeHTML(categories) {
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {
        var chosenCategory = chooseRandomCategory(categories);
        var homeHtmlToInsert = insertProperty(
          homeHtml,
          "randomCategoryShortName",
          "'" + chosenCategory.short_name + "'"
        );

        insertHtml("#main-content", homeHtmlToInsert);
      },
      false
    );
  }

  function chooseRandomCategory(categories) {
    return categories[Math.floor(Math.random() * categories.length)];
  }

  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  function buildAndShowCategoriesHTML(categories) {
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (titleHtml) {
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            switchMenuToActive();
            var html =
              titleHtml +
              "<section class='row'>" +
              categories
                .map(function (cat) {
                  var item = categoryHtml;
                  item = insertProperty(item, "name", cat.name);
                  item = insertProperty(item, "short_name", cat.short_name);
                  return item;
                })
                .join("") +
              "</section>";

            insertHtml("#main-content", html);
          },
          false
        );
      },
      false
    );
  }

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (titleHtml) {
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (itemHtml) {
            switchMenuToActive();
            var html = buildMenuItemsViewHtml(
              categoryMenuItems,
              titleHtml,
              itemHtml
            );
            insertHtml("#main-content", html);
          },
          false
        );
      },
      false
    );
  }

  function buildMenuItemsViewHtml(categoryMenuItems, titleHtml, itemHtml) {
    titleHtml = insertProperty(
      titleHtml,
      "name",
      categoryMenuItems.category.name
    );
    titleHtml = insertProperty(
      titleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions || ""
    );

    var finalHtml = titleHtml + "<section class='row'>";
    var items = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;

    items.forEach(function (item, i) {
      var html = itemHtml;
      html = insertProperty(html, "short_name", item.short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", item.price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        item.small_portion_name
      );
      html = insertItemPrice(html, "price_large", item.price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        item.large_portion_name
      );
      html = insertProperty(html, "name", item.name);
      html = insertProperty(html, "description", item.description);

      if (i % 2 !== 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    });

    return finalHtml + "</section>";
  }

  function insertItemPrice(html, prop, value) {
    return insertProperty(html, prop, value ? "$" + value.toFixed(2) : "");
  }

  function insertItemPortionName(html, prop, value) {
    return insertProperty(html, prop, value ? "(" + value + ")" : "");
  }

  global.$dc = dc;
})(window);
