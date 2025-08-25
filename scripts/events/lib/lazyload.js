'use strict';

const urlJoin = require('../../utils/url-join');

module.exports = (hexo) => {
  const config = hexo.theme.config;
  const loadingImage = urlJoin(hexo.config.root, config.lazyload.loading_img
    || urlJoin(config.static_prefix.internal_img, 'loading.gif'));
  if (!config.lazyload || !config.lazyload.enable || !loadingImage) {
    return;
  }
  if (config.lazyload.onlypost) {
    hexo.extend.filter.register('after_post_render', (page) => {
      if (page.layout !== 'post' && !page.lazyload) {
        return;
      }
      if (page.lazyload !== false) {
        page.content = lazyImages(page.content, loadingImage);
        page.content = lazyComments(page.content);
      }
      return page;
    });
  } else {
    hexo.extend.filter.register('after_render:html', (html, data) => {
      if (!data.page || data.page.lazyload !== false) {
        html = lazyImages(html, loadingImage);
        html = lazyComments(html);
        return html;
      }
    });
  }
};

const lazyImages = (htmlContent, loadingImage) => {
  return htmlContent.replace(/<img[^>]+?src=(".*?")[^>]*?>/gims, (str, p1) => {
    // 如果已经处理过，跳过
    if (/lazyload/i.test(str)) {
      return str;
    }
    // 将src属性移动到data-src，使用loading图片作为占位符，并添加lazyload属性
    return str.replace(/src=/i, `src="${loadingImage}" data-src=`).replace(/<img/i, '<img lazyload');
  });
};

const lazyComments = (htmlContent) => {
  return htmlContent.replace(/<[^>]+?id="comments"[^>]*?>/gims, (str) => {
    if (/lazyload/i.test(str)) {
      return str;
    }
    return str.replace('id="comments"', 'id="comments" lazyload');
  });
};
