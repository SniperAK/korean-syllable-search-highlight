# Korean Syllable Search and Hightlight Engine
- 한국어 초성 검색 & 하이라이트 엔진
- Pure javascirpt로 개발 되어있습니다. 

# smaple


```javascript

// impoort 
const SyllableSearchEngine = require('./index.js');

// search data
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

// define decorator
const _decorator = ( element, isMatched )=>{
  if( isMatched ) return element.red.bgWhite;
  return element;
}

// genrate engine instance with query 
const searchEngine = new SyllableSearchEngine( query, {multi:true} );

// do search
const filteredList = testList.filter( searchEngine.search( item=>{
  return [
    item.name, 
    item.phone && item.phone
  ].filter(e=>e);
}));

// highliting
const _renderItem = ( searchEngine, item )=>{
  let name = searchEngine.decorator(item.name, _decorator ).join(''), phone;
  if( item.phone ){
    phone = searchEngine.decorator(item.phone, _decorator ).join('');
    return `${name} (${phone})`;
  }
  return name;
}

console.log( filteredList.map(_renderItem.bind(this, searchEngine)).join('\n') );
```