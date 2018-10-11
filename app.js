const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 0,
      height: 0
    },
    args: ['--start-maximized'],
  });
  const page = await browser.newPage();
  // await page.goto('https://detail.tmall.com/item.htm?id=571672795767&ali_refid=a3_430583_1006:1125438179:N:JavaScript%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1:7398ea3e17099856997058b3847442f8&ali_trackid=1_7398ea3e17099856997058b3847442f8&spm=a230r.1.14.1');
  // await page.goto('https://item.taobao.com/item.htm?spm=a230r.1.14.258.c11438ccB6zLo0&id=545948305821&ns=1&abbucket=10#detail');
  await page.goto('https://item.taobao.com/item.htm?spm=a230r.1.14.22.57da43c8at3y9D&id=565969412455&ns=1&abbucket=10#detail');

  // await page.waitFor('#sufei-dialog-close');
  // await page.click('#sufei-dialog-close')
  await page.waitFor('.tb-main-title');
  let projectInfo = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      /**
       * 获取商品标题
       */
      let title = document.getElementsByClassName('tb-main-title')[0].innerText

      /**
       * 价格获取
       * 判断是否有减价，如有减价，则取减价
       */
      let promoPriceDom = document.getElementById('J_PromoPriceNum')
      let priceDom = document.getElementById('J_StrPrice')
      let price = promoPriceDom ? promoPriceDom.innerText : priceDom.innerText

      /**
       * 缩略图
       */
      let imgs = []
      let ulDom = document.getElementById('J_UlThumb')
      let lis = ulDom.getElementsByTagName('li')
      for (let i = 0 ; i < lis.length ; i ++) {
        if (lis[i].hasAttribute('data-index')) {
          let img = lis[i].getElementsByTagName('img')[0]
          let imgUrl = img.getAttribute('data-src').replace('50x50', '200x200')
          imgs.push(imgUrl)
        }
      }

      resolve({
        title: title,
        price: price,
        imgs: imgs
      })
    })
  })
  console.log(JSON.stringify(projectInfo, null, 2))
  // await page.type('#TPL_username_1', '1441001905')
  // await browser.close();
})();