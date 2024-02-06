export default {
  name: 'Not Found Page',
  alias: '404',
  styles: `display: flex;
justify-content: center;
align-items: center;
text-align: center;
height: 100%;
padding: 20px;`,
  template: `<div>
  <h1>404 - Page Not Found</h1>
  <p>I'm sorry, the page you were looking for cannot be found!</p>
</div>`,
  access_script: 'true',
  __lock: ['delete'],
};
