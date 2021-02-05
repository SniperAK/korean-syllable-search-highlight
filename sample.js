// require('./app/utils/prototypes');
require('colors');
const readlline = require('readline').createInterface({
  input : process.stdin,
  output: process.stdout
});
const logT = (t, ...args)=>console.log( ...args, t ? ` ${Date.now() - t}ms` : '' );
const Q    = q=>new Promise( r=>readlline.question( q, r))
let s      = Date.now();

const testList = [
  {name:'동해물과', phone:'02-1234-0000'},
  {name:'백두산이'},
  {name:'마르고'},
  {name:'닳도록'},
  {name:'하느님이'},
  {name:'보우하사'},
  {name:'우리나라만세'},
  {name:'무궁화'},
  {name:'삼천리'},
  {name:'화려강산'},
  {name:'대한사람'},
  {name:'대한으로'},
  {name:'길이 보전하세'},
  {name:'잠진적인 가능성 족적'},
];

const SyllableSearchEngine = require('./index.js');

const _decorator = ( element, isMatched )=>{
  if( isMatched ) return element.red.bgWhite;
  return element;
}
const _renderItem = ( searchEngine, item )=>{
  let name = searchEngine.decorator(item.name, _decorator ).join(''), phone;
  if( item.phone ){
    phone = searchEngine.decorator(item.phone, _decorator ).join('');
    return `${name} (${phone})`;
  }
  return name;
}

let doSearch = ()=>Q('> ').then(query=>{
  let s = Date.now();
  if( !query || query.length == 0 ) return console.log( 'Input Search Keyword ');
  if( query == '/q' ) return console.log( 'Quit. Thanks.', process.exit( 0 ) );
  
  let searchEngine = new SyllableSearchEngine( query, {multi:true} );

  let filteredList = testList.filter( searchEngine.search( item=>{
    return [
      item.name, 
      item.phone && item.phone
    ].filter(e=>e);
  }));

  let renderedItem = filteredList.map(_renderItem.bind(this, searchEngine)).join('\n')
  
  logT(s, renderedItem );
}).catch(e=>console.error( e )).then( doSearch );

doSearch();