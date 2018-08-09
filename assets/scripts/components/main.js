import Component from './component';
import routerParam from './router';
import alertParam from './alert';

async function main() {
  await Component.of(routerParam);
  await Component.of(alertParam);
  return console.log('组件加载完毕');
}

export default main;
