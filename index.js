const KoreanFirstableSyllable  = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const FirstLetterForKorean = '가'.charCodeAt(), LastLetterForKorean = '힣'.charCodeAt();
const debug = true;

const escapeRegEx = text=>text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const toSyllable = (string)=>{
  let count = string.length, syllables = [], char;
  for(let i = 0; i < count; i++) {
    char = string.charCodeAt(i);
    if (char < FirstLetterForKorean || char > LastLetterForKorean ) syllables.push(string.charAt(i));
    else {
      char = (((char - FirstLetterForKorean) - (char - FirstLetterForKorean) % 28) / 28);
      syllables.push(KoreanFirstableSyllable[(char - (char % 21) ) / 21]);
    }
  }
  return syllables.join('');
}

const regexIndexOf = (string, regex, startpos)=>{
  var indexOf = string.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

const getMatches = (string, regex, count) =>{
  if( !regex ) return null;
  let start = 0, index, indices = [];
  
  while ((index = regexIndexOf(string, regex, start)) > -1) {
    indices.push([index, count]);
    start = index + 1;
  }
  return indices;
}

const rangesToFlags = (ranges)=>{
  return ranges.reduce((p, [s, l])=>{
    if( p.length < s ) p.push( ...Array( s - p.length).fill( false ) );
    p.splice( s, 0, ...Array( l ).fill( true ) );
    return p.splice( 0, s + l );
  },[]);
}

const flagsToRanges = (flags)=>{
  return flags.reduce((p,c,i,a)=>{
    if( a[i-1] === true && c ) p.splice( p.length - 1, 1, [p[p.length - 1][0], p[p.length - 1][1] + 1]);
    else if( c ) p.push([i, 1]);
    return p; 
   },[]);
}

const rangeOperation = ( operator, ..._ranges ) => {
  let ranges = _ranges.filter(r=>r);
  if( ranges.length == 0 ) return null;
  if( ranges.length == 1 ) return flagsToRanges(rangesToFlags(ranges[0]));
  let flags = ranges.map(rangesToFlags);
  return flagsToRanges( flags.reduce((p,c)=>(p.length > c.length ? p : c)).map((_, i)=>{
    if( operator == '&&' ) return flags.reduce((p,flag)=>p && !!flag[i], true);
    if( operator == '||' ) return flags.reduce((p,flag)=>p || !!flag[i], false);
  }));
}

class SyllableSearchEngine {
  constructor( query, options ){
    this.query    = query;
    this.patterns = this._generatePattern( query, options );
    this.search   = this.search.bind(this);
    this.decorator= this.decorator.bind(this);
  }

  _findRange(target){
    return rangeOperation('||', ... this.patterns.map(({stringRegEx, syllableRegEx, query}, i)=>{
      return rangeOperation( '&&', 
        stringRegEx   ? getMatches(            target,  stringRegEx,    query.length) : null,
        syllableRegEx ? getMatches( toSyllable(target), syllableRegEx , query.length) : null 
      );
    }))
  }

  _generatePattern( query, {multi} = {}){
    let queries = multi ? query.split( / |\|/ig ) : [query];
    return queries.map(query=>({
      query, 
      stringRegEx:    /[^ㄱ-ㅎ]/ig.test(query) ? new RegExp(            escapeRegEx(query).replace(/[ㄱ-ㅎ]/ig, '.'), 'ig' ) : null,
      syllableRegEx:   /[ㄱ-ㅎ]/ig.test(query) ? new RegExp( escapeRegEx(toSyllable(query)).replace(/[^ㄱ-ㅎ]/ig, '.'), 'ig' ) : null,
    }))
  }
  
  search( targeter ){
    return ( item, index, list )=>{
      let targets = targeter ? targeter( item ) : item;
      if( !(typeof targets === 'object' && targets.constructor == Array) ) targets = [targets];
      return targets.map(s=>this._findRange( s )).filter(r=>r && r.length > 0 ).length  > 0;
    }
  }
  
  autoComplete( targeter ){
    return ( item, index, list )=>{
      let targets = targeter ? targeter( item ) : item;
      if( !(typeof targets === 'object' && targets.constructor == Array) ) targets = [targets];
      return targets.map(target=>({
        target,
        range:this._findRange( target )
      })).filter(({range})=>range && range.length > 0 ).map(({target})=>target);
    }
  }
  
  decorator( string, callback ){
    if( typeof string != 'string' ) return [callback(string, false, 0)];
    let range = this._findRange( string );
    if( !range || range.length == 0 ) return [callback(string, false, 0)];

    let b = [0,0];
    return range.reduce((p,c,i,a)=>{
      let [bi, bl] = b, [ci, cl] = c;
      if( ci - (bi + bl) > 0 ) p.push( callback( string.substring(bi + bl, ci), false, bi + bl ) );
      p.push( callback( string.substring(ci, ci + cl), true, ci ) );
      if( a.length - 1 == i && string.length - (ci + cl) > 0 ) p.push( callback( string.substring(ci + cl, string.length), false, ci + cl ) );
      b = c;
      return p;
    },[])
  }
}
module.exports = SyllableSearchEngine;
