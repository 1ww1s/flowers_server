

 
export const rendertronMiddlewareConfig = {
    proxyUrl: 'http://your-rendertron-service.com/render', // URL вашего Rendertron
    injectShadyDom: true, // Для поддержки Web Components
    timeout: 10000 // 10 секунд на рендеринг
  };