const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 375,
      height: 667
    },
    // executablePath: '../../application/chrome',
    isMobile: true,
    // devtools: true,
    // args: ['--start-maximized'],
  });
  
  try {

    const page = await browser.newPage();

    // 纯文字商品（PC端）
    // await page.goto('https://item.taobao.com/item.htm?spm=a230r.1.14.20.c11438ccB6zLo0&id=574324982799&ns=1&abbucket=10#detail');
    
    // 带图的商品（PC端）
    // await page.goto('https://item.taobao.com/item.htm?spm=a230r.1.14.22.57da43c8at3y9D&id=565969412455&ns=1&abbucket=10#detail');

    // 带图的商品（PC端）
    // await page.goto('https://item.taobao.com/item.htm?spm=a230r.1.14.258.c11438ccB6zLo0&id=545948305821&ns=1&abbucket=10#detail');
    
    // 纯文字商品（移动端）
    await page.goto('https://h5.m.taobao.com/awp/core/detail.htm?spm=a230r.1.14.20.c11438ccB6zLo0&id=574324982799&ns=1&abbucket=10#detail');
    
    // 带图的商品（移动端）
    // await page.goto('https://h5.m.taobao.com/awp/core/detail.htm?spm=a230r.1.14.258.c11438ccB6zLo0&id=545948305821&ns=1&abbucket=10#detail');

    // 带图的商品（移动端）
    // await page.goto('https://h5.m.taobao.com/awp/core/detail.htm?spm=a230r.1.14.22.57da43c8at3y9D&id=565969412455&ns=1&abbucket=10#detail');

    await page.waitFor('.pic-gallery-wrapper')
    await scrollTo(page, 2000)
    await page.waitForXPath('/html/body/div[1]/div[2]/div[2]')
    let projectInfo = {}

    projectInfo = await getMobileTaobaoGoodsInfo(page)
    console.log(JSON.stringify(projectInfo, null, 2))

  } catch (e) {
    console.error(e)
  }
  await browser.close();

})();

/**
 * 获取移动端淘宝页面商品信息
 * @param {Object} page page 对象
 */
async function getMobileTaobaoGoodsInfo (page) {
  return page.evaluate(() => {
    return new Promise((resolve, reject) => {
      /**
       * 获取商品标题
       */
      let titleDom = document.querySelector('div[data-tpl-id="detail_title_normal_1"]')
      let title = ''
      if (titleDom) {
        title = titleDom.innerText
      }

      /**
       * 获取商品价格
       */
      let priceDom = document.getElementsByClassName('o-t-price') ? document.getElementsByClassName('o-t-price')[0] : null
      let price = 0
      if (priceDom) {
        price = priceDom.innerText
      }
      /**
       * 获取缩略图
       */
      let imgs = []
      let imgsWrap = document.getElementsByClassName('siema') ? document.getElementsByClassName('siema')[0] : null
      if (imgsWrap) {
        let imgsDom = imgsWrap.getElementsByTagName('img')
        if (imgsDom && imgsDom.length > 0) {
          for (i = 0 ; i < imgsDom.length - 2 ; i ++) {
            let imgUrl = imgsDom[i].getAttribute('src')
            imgs.push(imgUrl)
          }
        }
      }

      /**
       * 获取来源
       */
      let from = ''
      let fromWrap = document.querySelector('div[data-tpl-id="detail_subinfo_1"]')
      if (fromWrap) {
        let contWrap = fromWrap.querySelectorAll('div[view-name="DTextView"]')
        if (contWrap && contWrap.length > 0) {
          from = contWrap[contWrap.length - 1].innerText
        }
      }

      /**
       * 获取描述
       */

      // 获取描述缩略图
      let desImgs = []
      let desDom = document.getElementsByClassName('detail-content') ? document.getElementsByClassName('detail-content')[0] : null
      if (desDom) {
        let desImgsDom = desDom.getElementsByTagName('img')
        console.log(desDom.innerHTML)
        console.log(desImgsDom)
        if (desImgsDom && desImgsDom.length > 0) {
          for (let i = 0 ; i < desImgsDom.length ; i ++) {
            let imgUrl = desImgsDom[i].getAttribute('data-ks-lazyload') || desImgsDom[i].getAttribute('src')
            desImgs.push(imgUrl)
          }
        }
      }
      // 描述中内容
      let desPsDom = desDom.getElementsByTagName('p')
      let desPs = []
      if (desPsDom && desPsDom.length > 0) {
        for (let i = 0 ; i < desPsDom.length ; i ++) {
          let pCont = desPsDom[i].innerText
          if (pCont) {
            desPs.push(pCont)
          }
        }
      }

      resolve({
        title: title,
        price: price,
        imgs: imgs,
        from: from,
        desImgs: desImgs,
        desPs: desPs
      })
      // console.log(title)
    })
  })
}

/**
 * 获取PC淘宝页面的商品信息
 * @param {Object} page page 对象
 */
async function getPCTaobaoGoodsInfo (page) {
  return page.evaluate(() => {
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

      /**
       * 发货地
       */
      let fromDom = document.getElementById('J-From')
      let from = ''
      if (fromDom) {
        from = fromDom.innerText
      }

      /**
       * 描述部分
       */

      // 描述中图片
      let desDom = document.getElementById('J_DivItemDesc')
      let desImgsDom = desDom.getElementsByTagName('img')
      let desImgs = []
      if (desImgsDom && desImgsDom.length > 0) {
        for (let i = 0 ; i < desImgsDom.length ; i ++) {
          let imgUrl = desImgsDom[i].getAttribute('data-ks-lazyload') || desImgsDom[i].getAttribute('src')
          desImgs.push(imgUrl)
        }
      }
      // 描述中内容
      let desPsDom = desDom.getElementsByTagName('p')
      let desPs = []
      if (desPsDom && desPsDom.length > 0) {
        for (let i = 0 ; i < desPsDom.length ; i ++) {
          let pCont = desPsDom[i].innerText
          if (pCont) {
            desPs.push(pCont)
          }
        }
      }

      resolve({
        title: title,
        price: price,
        imgs: imgs,
        from: from,
        desImgs: desImgs,
        desPs: desPs
      })
    })
  })
}

/**
 * 自动滚动
 * @param {Object} page page 对象
 */
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

/**
 * 滚动到某处
 * @param {Object} page page 对象
 * @param {number} position 位置
 */
async function scrollTo(page, position){
  await page.evaluate(async (position) => {
    window.scrollBy(0, position)
  }, position);
}