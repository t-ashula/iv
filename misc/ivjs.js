// The MIT License
// 
// Copyright (c) <2010> <Constellation>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var Lexer, Parser;
(function() {
  var IDENT = new Object(), EOS = 0, ILLEGAL = 1, NOTFOUND = 2,
      EXP = "EXP", STMT = "STMT", DECL = "DECL";

  var IdentifierStart = /^(?:[\u0041-\u005A]|[\u0061-\u007A]|\u00AA|\u00B5|\u00BA|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02C1]|[\u02C6-\u02D1]|[\u02E0-\u02E4]|\u02EC|\u02EE|[\u0370-\u0374]|\u0376|\u0377|[\u037A-\u037D]|\u0386|[\u0388-\u038A]|\u038C|[\u038E-\u03A1]|[\u03A3-\u03F5]|[\u03F7-\u0481]|[\u048A-\u0525]|[\u0531-\u0556]|\u0559|[\u0561-\u0587]|[\u05D0-\u05EA]|[\u05F0-\u05F2]|[\u0621-\u064A]|\u066E|\u066F|[\u0671-\u06D3]|\u06D5|\u06E5|\u06E6|\u06EE|\u06EF|[\u06FA-\u06FC]|\u06FF|\u0710|[\u0712-\u072F]|[\u074D-\u07A5]|\u07B1|[\u07CA-\u07EA]|\u07F4|\u07F5|\u07FA|[\u0800-\u0815]|\u081A|\u0824|\u0828|[\u0904-\u0939]|\u093D|\u0950|[\u0958-\u0961]|\u0971|\u0972|[\u0979-\u097F]|[\u0985-\u098C]|\u098F|\u0990|[\u0993-\u09A8]|[\u09AA-\u09B0]|\u09B2|[\u09B6-\u09B9]|\u09BD|\u09CE|\u09DC|\u09DD|[\u09DF-\u09E1]|\u09F0|\u09F1|[\u0A05-\u0A0A]|\u0A0F|\u0A10|[\u0A13-\u0A28]|[\u0A2A-\u0A30]|\u0A32|\u0A33|\u0A35|\u0A36|\u0A38|\u0A39|[\u0A59-\u0A5C]|\u0A5E|[\u0A72-\u0A74]|[\u0A85-\u0A8D]|[\u0A8F-\u0A91]|[\u0A93-\u0AA8]|[\u0AAA-\u0AB0]|\u0AB2|\u0AB3|[\u0AB5-\u0AB9]|\u0ABD|\u0AD0|\u0AE0|\u0AE1|[\u0B05-\u0B0C]|\u0B0F|\u0B10|[\u0B13-\u0B28]|[\u0B2A-\u0B30]|\u0B32|\u0B33|[\u0B35-\u0B39]|\u0B3D|\u0B5C|\u0B5D|[\u0B5F-\u0B61]|\u0B71|\u0B83|[\u0B85-\u0B8A]|[\u0B8E-\u0B90]|[\u0B92-\u0B95]|\u0B99|\u0B9A|\u0B9C|\u0B9E|\u0B9F|\u0BA3|\u0BA4|[\u0BA8-\u0BAA]|[\u0BAE-\u0BB9]|\u0BD0|[\u0C05-\u0C0C]|[\u0C0E-\u0C10]|[\u0C12-\u0C28]|[\u0C2A-\u0C33]|[\u0C35-\u0C39]|\u0C3D|\u0C58|\u0C59|\u0C60|\u0C61|[\u0C85-\u0C8C]|[\u0C8E-\u0C90]|[\u0C92-\u0CA8]|[\u0CAA-\u0CB3]|[\u0CB5-\u0CB9]|\u0CBD|\u0CDE|\u0CE0|\u0CE1|[\u0D05-\u0D0C]|[\u0D0E-\u0D10]|[\u0D12-\u0D28]|[\u0D2A-\u0D39]|\u0D3D|\u0D60|\u0D61|[\u0D7A-\u0D7F]|[\u0D85-\u0D96]|[\u0D9A-\u0DB1]|[\u0DB3-\u0DBB]|\u0DBD|[\u0DC0-\u0DC6]|[\u0E01-\u0E30]|\u0E32|\u0E33|[\u0E40-\u0E46]|\u0E81|\u0E82|\u0E84|\u0E87|\u0E88|\u0E8A|\u0E8D|[\u0E94-\u0E97]|[\u0E99-\u0E9F]|[\u0EA1-\u0EA3]|\u0EA5|\u0EA7|\u0EAA|\u0EAB|[\u0EAD-\u0EB0]|\u0EB2|\u0EB3|\u0EBD|[\u0EC0-\u0EC4]|\u0EC6|\u0EDC|\u0EDD|\u0F00|[\u0F40-\u0F47]|[\u0F49-\u0F6C]|[\u0F88-\u0F8B]|[\u1000-\u102A]|\u103F|[\u1050-\u1055]|[\u105A-\u105D]|\u1061|\u1065|\u1066|[\u106E-\u1070]|[\u1075-\u1081]|\u108E|[\u10A0-\u10C5]|[\u10D0-\u10FA]|\u10FC|[\u1100-\u1248]|[\u124A-\u124D]|[\u1250-\u1256]|\u1258|[\u125A-\u125D]|[\u1260-\u1288]|[\u128A-\u128D]|[\u1290-\u12B0]|[\u12B2-\u12B5]|[\u12B8-\u12BE]|\u12C0|[\u12C2-\u12C5]|[\u12C8-\u12D6]|[\u12D8-\u1310]|[\u1312-\u1315]|[\u1318-\u135A]|[\u1380-\u138F]|[\u13A0-\u13F4]|[\u1401-\u166C]|[\u166F-\u167F]|[\u1681-\u169A]|[\u16A0-\u16EA]|[\u16EE-\u16F0]|[\u1700-\u170C]|[\u170E-\u1711]|[\u1720-\u1731]|[\u1740-\u1751]|[\u1760-\u176C]|[\u176E-\u1770]|[\u1780-\u17B3]|\u17D7|\u17DC|[\u1820-\u1877]|[\u1880-\u18A8]|\u18AA|[\u18B0-\u18F5]|[\u1900-\u191C]|[\u1950-\u196D]|[\u1970-\u1974]|[\u1980-\u19AB]|[\u19C1-\u19C7]|[\u1A00-\u1A16]|[\u1A20-\u1A54]|\u1AA7|[\u1B05-\u1B33]|[\u1B45-\u1B4B]|[\u1B83-\u1BA0]|\u1BAE|\u1BAF|[\u1C00-\u1C23]|[\u1C4D-\u1C4F]|[\u1C5A-\u1C7D]|[\u1CE9-\u1CEC]|[\u1CEE-\u1CF1]|[\u1D00-\u1DBF]|[\u1E00-\u1F15]|[\u1F18-\u1F1D]|[\u1F20-\u1F45]|[\u1F48-\u1F4D]|[\u1F50-\u1F57]|\u1F59|\u1F5B|\u1F5D|[\u1F5F-\u1F7D]|[\u1F80-\u1FB4]|[\u1FB6-\u1FBC]|\u1FBE|[\u1FC2-\u1FC4]|[\u1FC6-\u1FCC]|[\u1FD0-\u1FD3]|[\u1FD6-\u1FDB]|[\u1FE0-\u1FEC]|[\u1FF2-\u1FF4]|[\u1FF6-\u1FFC]|\u2071|\u207F|[\u2090-\u2094]|\u2102|\u2107|[\u210A-\u2113]|\u2115|[\u2119-\u211D]|\u2124|\u2126|\u2128|[\u212A-\u212D]|[\u212F-\u2139]|[\u213C-\u213F]|[\u2145-\u2149]|\u214E|[\u2160-\u2188]|[\u2C00-\u2C2E]|[\u2C30-\u2C5E]|[\u2C60-\u2CE4]|[\u2CEB-\u2CEE]|[\u2D00-\u2D25]|[\u2D30-\u2D65]|\u2D6F|[\u2D80-\u2D96]|[\u2DA0-\u2DA6]|[\u2DA8-\u2DAE]|[\u2DB0-\u2DB6]|[\u2DB8-\u2DBE]|[\u2DC0-\u2DC6]|[\u2DC8-\u2DCE]|[\u2DD0-\u2DD6]|[\u2DD8-\u2DDE]|\u2E2F|[\u3005-\u3007]|[\u3021-\u3029]|[\u3031-\u3035]|[\u3038-\u303C]|[\u3041-\u3096]|[\u309D-\u309F]|[\u30A1-\u30FA]|[\u30FC-\u30FF]|[\u3105-\u312D]|[\u3131-\u318E]|[\u31A0-\u31B7]|[\u31F0-\u31FF]|[\u3400-\u4DB5]|[\u4E00-\u9FCB]|[\uA000-\uA48C]|[\uA4D0-\uA4FD]|[\uA500-\uA60C]|[\uA610-\uA61F]|\uA62A|\uA62B|[\uA640-\uA65F]|[\uA662-\uA66E]|[\uA67F-\uA697]|[\uA6A0-\uA6EF]|[\uA717-\uA71F]|[\uA722-\uA788]|\uA78B|\uA78C|[\uA7FB-\uA801]|[\uA803-\uA805]|[\uA807-\uA80A]|[\uA80C-\uA822]|[\uA840-\uA873]|[\uA882-\uA8B3]|[\uA8F2-\uA8F7]|\uA8FB|[\uA90A-\uA925]|[\uA930-\uA946]|[\uA960-\uA97C]|[\uA984-\uA9B2]|\uA9CF|[\uAA00-\uAA28]|[\uAA40-\uAA42]|[\uAA44-\uAA4B]|[\uAA60-\uAA76]|\uAA7A|[\uAA80-\uAAAF]|\uAAB1|\uAAB5|\uAAB6|[\uAAB9-\uAABD]|\uAAC0|\uAAC2|[\uAADB-\uAADD]|[\uABC0-\uABE2]|[\uAC00-\uD7A3]|[\uD7B0-\uD7C6]|[\uD7CB-\uD7FB]|[\uF900-\uFA2D]|[\uFA30-\uFA6D]|[\uFA70-\uFAD9]|[\uFB00-\uFB06]|[\uFB13-\uFB17]|\uFB1D|[\uFB1F-\uFB28]|[\uFB2A-\uFB36]|[\uFB38-\uFB3C]|\uFB3E|\uFB40|\uFB41|\uFB43|\uFB44|[\uFB46-\uFBB1]|[\uFBD3-\uFD3D]|[\uFD50-\uFD8F]|[\uFD92-\uFDC7]|[\uFDF0-\uFDFB]|[\uFE70-\uFE74]|[\uFE76-\uFEFC]|[\uFF21-\uFF3A]|[\uFF41-\uFF5A]|[\uFF66-\uFFBE]|[\uFFC2-\uFFC7]|[\uFFCA-\uFFCF]|[\uFFD2-\uFFD7]|[\uFFDA-\uFFDC]|_|$|\u[da-fA-F]{4})/;
  var IdentifierPart = /^((?:[\u0030-\u0039]|[\u0041-\u005A]|\u005F|[\u0061-\u007A]|\u00AA|\u00B5|\u00BA|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02C1]|[\u02C6-\u02D1]|[\u02E0-\u02E4]|\u02EC|\u02EE|[\u0300-\u0374]|\u0376|\u0377|[\u037A-\u037D]|\u0386|[\u0388-\u038A]|\u038C|[\u038E-\u03A1]|[\u03A3-\u03F5]|[\u03F7-\u0481]|[\u0483-\u0487]|[\u048A-\u0525]|[\u0531-\u0556]|\u0559|[\u0561-\u0587]|[\u0591-\u05BD]|\u05BF|\u05C1|\u05C2|\u05C4|\u05C5|\u05C7|[\u05D0-\u05EA]|[\u05F0-\u05F2]|[\u0610-\u061A]|[\u0621-\u065E]|[\u0660-\u0669]|[\u066E-\u06D3]|[\u06D5-\u06DC]|[\u06DF-\u06E8]|[\u06EA-\u06FC]|\u06FF|[\u0710-\u074A]|[\u074D-\u07B1]|[\u07C0-\u07F5]|\u07FA|[\u0800-\u082D]|[\u0900-\u0939]|[\u093C-\u094E]|[\u0950-\u0955]|[\u0958-\u0963]|[\u0966-\u096F]|\u0971|\u0972|[\u0979-\u097F]|[\u0981-\u0983]|[\u0985-\u098C]|\u098F|\u0990|[\u0993-\u09A8]|[\u09AA-\u09B0]|\u09B2|[\u09B6-\u09B9]|[\u09BC-\u09C4]|\u09C7|\u09C8|[\u09CB-\u09CE]|\u09D7|\u09DC|\u09DD|[\u09DF-\u09E3]|[\u09E6-\u09F1]|[\u0A01-\u0A03]|[\u0A05-\u0A0A]|\u0A0F|\u0A10|[\u0A13-\u0A28]|[\u0A2A-\u0A30]|\u0A32|\u0A33|\u0A35|\u0A36|\u0A38|\u0A39|\u0A3C|[\u0A3E-\u0A42]|\u0A47|\u0A48|[\u0A4B-\u0A4D]|\u0A51|[\u0A59-\u0A5C]|\u0A5E|[\u0A66-\u0A75]|[\u0A81-\u0A83]|[\u0A85-\u0A8D]|[\u0A8F-\u0A91]|[\u0A93-\u0AA8]|[\u0AAA-\u0AB0]|\u0AB2|\u0AB3|[\u0AB5-\u0AB9]|[\u0ABC-\u0AC5]|[\u0AC7-\u0AC9]|[\u0ACB-\u0ACD]|\u0AD0|[\u0AE0-\u0AE3]|[\u0AE6-\u0AEF]|[\u0B01-\u0B03]|[\u0B05-\u0B0C]|\u0B0F|\u0B10|[\u0B13-\u0B28]|[\u0B2A-\u0B30]|\u0B32|\u0B33|[\u0B35-\u0B39]|[\u0B3C-\u0B44]|\u0B47|\u0B48|[\u0B4B-\u0B4D]|\u0B56|\u0B57|\u0B5C|\u0B5D|[\u0B5F-\u0B63]|[\u0B66-\u0B6F]|\u0B71|\u0B82|\u0B83|[\u0B85-\u0B8A]|[\u0B8E-\u0B90]|[\u0B92-\u0B95]|\u0B99|\u0B9A|\u0B9C|\u0B9E|\u0B9F|\u0BA3|\u0BA4|[\u0BA8-\u0BAA]|[\u0BAE-\u0BB9]|[\u0BBE-\u0BC2]|[\u0BC6-\u0BC8]|[\u0BCA-\u0BCD]|\u0BD0|\u0BD7|[\u0BE6-\u0BEF]|[\u0C01-\u0C03]|[\u0C05-\u0C0C]|[\u0C0E-\u0C10]|[\u0C12-\u0C28]|[\u0C2A-\u0C33]|[\u0C35-\u0C39]|[\u0C3D-\u0C44]|[\u0C46-\u0C48]|[\u0C4A-\u0C4D]|\u0C55|\u0C56|\u0C58|\u0C59|[\u0C60-\u0C63]|[\u0C66-\u0C6F]|\u0C82|\u0C83|[\u0C85-\u0C8C]|[\u0C8E-\u0C90]|[\u0C92-\u0CA8]|[\u0CAA-\u0CB3]|[\u0CB5-\u0CB9]|[\u0CBC-\u0CC4]|[\u0CC6-\u0CC8]|[\u0CCA-\u0CCD]|\u0CD5|\u0CD6|\u0CDE|[\u0CE0-\u0CE3]|[\u0CE6-\u0CEF]|\u0D02|\u0D03|[\u0D05-\u0D0C]|[\u0D0E-\u0D10]|[\u0D12-\u0D28]|[\u0D2A-\u0D39]|[\u0D3D-\u0D44]|[\u0D46-\u0D48]|[\u0D4A-\u0D4D]|\u0D57|[\u0D60-\u0D63]|[\u0D66-\u0D6F]|[\u0D7A-\u0D7F]|\u0D82|\u0D83|[\u0D85-\u0D96]|[\u0D9A-\u0DB1]|[\u0DB3-\u0DBB]|\u0DBD|[\u0DC0-\u0DC6]|\u0DCA|[\u0DCF-\u0DD4]|\u0DD6|[\u0DD8-\u0DDF]|\u0DF2|\u0DF3|[\u0E01-\u0E3A]|[\u0E40-\u0E4E]|[\u0E50-\u0E59]|\u0E81|\u0E82|\u0E84|\u0E87|\u0E88|\u0E8A|\u0E8D|[\u0E94-\u0E97]|[\u0E99-\u0E9F]|[\u0EA1-\u0EA3]|\u0EA5|\u0EA7|\u0EAA|\u0EAB|[\u0EAD-\u0EB9]|[\u0EBB-\u0EBD]|[\u0EC0-\u0EC4]|\u0EC6|[\u0EC8-\u0ECD]|[\u0ED0-\u0ED9]|\u0EDC|\u0EDD|\u0F00|\u0F18|\u0F19|[\u0F20-\u0F29]|\u0F35|\u0F37|\u0F39|[\u0F3E-\u0F47]|[\u0F49-\u0F6C]|[\u0F71-\u0F84]|[\u0F86-\u0F8B]|[\u0F90-\u0F97]|[\u0F99-\u0FBC]|\u0FC6|[\u1000-\u1049]|[\u1050-\u109D]|[\u10A0-\u10C5]|[\u10D0-\u10FA]|\u10FC|[\u1100-\u1248]|[\u124A-\u124D]|[\u1250-\u1256]|\u1258|[\u125A-\u125D]|[\u1260-\u1288]|[\u128A-\u128D]|[\u1290-\u12B0]|[\u12B2-\u12B5]|[\u12B8-\u12BE]|\u12C0|[\u12C2-\u12C5]|[\u12C8-\u12D6]|[\u12D8-\u1310]|[\u1312-\u1315]|[\u1318-\u135A]|\u135F|[\u1380-\u138F]|[\u13A0-\u13F4]|[\u1401-\u166C]|[\u166F-\u167F]|[\u1681-\u169A]|[\u16A0-\u16EA]|[\u16EE-\u16F0]|[\u1700-\u170C]|[\u170E-\u1714]|[\u1720-\u1734]|[\u1740-\u1753]|[\u1760-\u176C]|[\u176E-\u1770]|\u1772|\u1773|[\u1780-\u17B3]|[\u17B6-\u17D3]|\u17D7|\u17DC|\u17DD|[\u17E0-\u17E9]|[\u180B-\u180D]|[\u1810-\u1819]|[\u1820-\u1877]|[\u1880-\u18AA]|[\u18B0-\u18F5]|[\u1900-\u191C]|[\u1920-\u192B]|[\u1930-\u193B]|[\u1946-\u196D]|[\u1970-\u1974]|[\u1980-\u19AB]|[\u19B0-\u19C9]|[\u19D0-\u19DA]|[\u1A00-\u1A1B]|[\u1A20-\u1A5E]|[\u1A60-\u1A7C]|[\u1A7F-\u1A89]|[\u1A90-\u1A99]|\u1AA7|[\u1B00-\u1B4B]|[\u1B50-\u1B59]|[\u1B6B-\u1B73]|[\u1B80-\u1BAA]|[\u1BAE-\u1BB9]|[\u1C00-\u1C37]|[\u1C40-\u1C49]|[\u1C4D-\u1C7D]|[\u1CD0-\u1CD2]|[\u1CD4-\u1CF2]|[\u1D00-\u1DE6]|[\u1DFD-\u1F15]|[\u1F18-\u1F1D]|[\u1F20-\u1F45]|[\u1F48-\u1F4D]|[\u1F50-\u1F57]|\u1F59|\u1F5B|\u1F5D|[\u1F5F-\u1F7D]|[\u1F80-\u1FB4]|[\u1FB6-\u1FBC]|\u1FBE|[\u1FC2-\u1FC4]|[\u1FC6-\u1FCC]|[\u1FD0-\u1FD3]|[\u1FD6-\u1FDB]|[\u1FE0-\u1FEC]|[\u1FF2-\u1FF4]|[\u1FF6-\u1FFC]|\u203F|\u2040|\u2054|\u2071|\u207F|[\u2090-\u2094]|[\u20D0-\u20DC]|\u20E1|[\u20E5-\u20F0]|\u2102|\u2107|[\u210A-\u2113]|\u2115|[\u2119-\u211D]|\u2124|\u2126|\u2128|[\u212A-\u212D]|[\u212F-\u2139]|[\u213C-\u213F]|[\u2145-\u2149]|\u214E|[\u2160-\u2188]|[\u2C00-\u2C2E]|[\u2C30-\u2C5E]|[\u2C60-\u2CE4]|[\u2CEB-\u2CF1]|[\u2D00-\u2D25]|[\u2D30-\u2D65]|\u2D6F|[\u2D80-\u2D96]|[\u2DA0-\u2DA6]|[\u2DA8-\u2DAE]|[\u2DB0-\u2DB6]|[\u2DB8-\u2DBE]|[\u2DC0-\u2DC6]|[\u2DC8-\u2DCE]|[\u2DD0-\u2DD6]|[\u2DD8-\u2DDE]|[\u2DE0-\u2DFF]|\u2E2F|[\u3005-\u3007]|[\u3021-\u302F]|[\u3031-\u3035]|[\u3038-\u303C]|[\u3041-\u3096]|\u3099|\u309A|[\u309D-\u309F]|[\u30A1-\u30FA]|[\u30FC-\u30FF]|[\u3105-\u312D]|[\u3131-\u318E]|[\u31A0-\u31B7]|[\u31F0-\u31FF]|[\u3400-\u4DB5]|[\u4E00-\u9FCB]|[\uA000-\uA48C]|[\uA4D0-\uA4FD]|[\uA500-\uA60C]|[\uA610-\uA62B]|[\uA640-\uA65F]|[\uA662-\uA66F]|\uA67C|\uA67D|[\uA67F-\uA697]|[\uA6A0-\uA6F1]|[\uA717-\uA71F]|[\uA722-\uA788]|\uA78B|\uA78C|[\uA7FB-\uA827]|[\uA840-\uA873]|[\uA880-\uA8C4]|[\uA8D0-\uA8D9]|[\uA8E0-\uA8F7]|\uA8FB|[\uA900-\uA92D]|[\uA930-\uA953]|[\uA960-\uA97C]|[\uA980-\uA9C0]|[\uA9CF-\uA9D9]|[\uAA00-\uAA36]|[\uAA40-\uAA4D]|[\uAA50-\uAA59]|[\uAA60-\uAA76]|\uAA7A|\uAA7B|[\uAA80-\uAAC2]|[\uAADB-\uAADD]|[\uABC0-\uABEA]|\uABEC|\uABED|[\uABF0-\uABF9]|[\uAC00-\uD7A3]|[\uD7B0-\uD7C6]|[\uD7CB-\uD7FB]|[\uF900-\uFA2D]|[\uFA30-\uFA6D]|[\uFA70-\uFAD9]|[\uFB00-\uFB06]|[\uFB13-\uFB17]|[\uFB1D-\uFB28]|[\uFB2A-\uFB36]|[\uFB38-\uFB3C]|\uFB3E|\uFB40|\uFB41|\uFB43|\uFB44|[\uFB46-\uFBB1]|[\uFBD3-\uFD3D]|[\uFD50-\uFD8F]|[\uFD92-\uFDC7]|[\uFDF0-\uFDFB]|[\uFE00-\uFE0F]|[\uFE20-\uFE26]|\uFE33|\uFE34|[\uFE4D-\uFE4F]|[\uFE70-\uFE74]|[\uFE76-\uFEFC]|[\uFF10-\uFF19]|[\uFF21-\uFF3A]|\uFF3F|[\uFF41-\uFF5A]|[\uFF66-\uFFBE]|[\uFFC2-\uFFC7]|[\uFFCA-\uFFCF]|[\uFFD2-\uFFD7]|[\uFFDA-\uFFDC]|_|$|\u[da-fA-F]{4})+)/;

  var LineTerminator = /^(?:\n\r|\r\n|\n|\r|\u2028|\u2029)/;

  var KEYWORDS = {
    "if": IDENT, "in": IDENT, "do": IDENT,
    "for": IDENT, "var": IDENT, "new": IDENT, "try": IDENT,
    "else": IDENT, "case": IDENT, "true": IDENT,
    "null": IDENT, "this": IDENT,
    "void": IDENT, "with": IDENT, "enum": IDENT,
    "break": IDENT, "catch": IDENT,
    "super": IDENT, "while": IDENT,
    "throw": IDENT, "class": IDENT,
    "const": IDENT, "false": IDENT,
    "delete": IDENT, "export": IDENT, "import": IDENT,
    "public": IDENT, "return": IDENT, "static": IDENT,
    "switch": IDENT, "typeof": IDENT,
    "default": IDENT, "extends": IDENT, "finally": IDENT,
    "package": IDENT, "private": IDENT,
    "debugger": IDENT, "continue": IDENT, "function": IDENT,
    "interface": IDENT, "protected": IDENT,
    "instanceof": IDENT, "implements": IDENT
  };
  var OPLIST = [
    "EOS", "ILLEGAL", "NOTFOUND",
    ".", ":", ";", ",",

    "(", ")", "[", "]", "{", "}",

    "?",

    "==", "===",

    "!", "!=", "!==",

    "++", "--",

    "+", "-", "*", "/", "%",

    "RELATIONAL_FIRST",
    "<", ">", "<=", ">=", "instanceof",
    "RELATIONAL_LAST",

    ">>", ">>>", "<<",

    "&", "|", "^", "~",

    "&&", "||",

    "ASSIGN_OP_FIRST",
    "=", "+=", "-=", "*=", "%=", "/=", ">>=", ">>>=", "<<=", "&=", "|=",
    "ASSIGN_OP_LAST",

    "delete", "typeof", "void", "break", "case", "catch", "continue", "debugger",
    "default", "do", "else", "finaly", "for", "function", "if", "in", "new",
    "return", "switch", "this", "throw", "try", "var", "while", "with",

    "abstract", "boolean", "byte", "char", "class", "const",
    "double","enum", "export", "extends", "final", "float",
    "goto", "implements", "import", "int", "interface", "long",
    "native", "package", "private", "protected", "public",
    "short", "static", "super", "synchronized", "throws",
    "transient", "volatile",

    "null", "false", "true", "NUMBER", "STRING", "IDENTIFIER"
  ];
  var OP = {};
  OPLIST.forEach(function(op, i) {
    OP[op] = i;
  });
  function isAssignOp(op) {
    return OP["ASSIGN_OP_FIRST"] < op && op < OP["ASSIGN_OP_LAST"];
  }
  function isRelationalOp(op) {
    return OP["RELATIONAL_FIRST"] < op && op < OP["RELATIONAL_LAST"];
  }
  Lexer = function Lexer(source) {
    this.current = source;
    this.value = null;
    this.pos = 0;
    this.hasLineTerminatorBeforeNext = false;
  };
  Lexer.EOS = EOS;
  Lexer.ILLEGAL = ILLEGAL;
  Lexer.opToString = function(op) {
    return OPLIST[op];
  };
  Lexer.prototype.next = function() {
    var token = NOTFOUND;
    this.hasLineTerminatorBeforeNext = false;
    // remove white space
    do {
      this.current = this.current.replace(/^[\u0009\u000B\u000C\uFEFF\u0020\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]*/, "");
      if (this.current) {
        if (/^\/\/|^\/\*/.test(this.current)) {
          // skip comment
          if (RegExp.lastMatch === "//") {
            // SingleLineComment
            this.current = RegExp.rightContext.replace(/^[^\n\r\u2028\u2029]*/, "");
          } else {
            // MultiLineComment
            if (/^\/\*([\s\S]*?)\*\//.test(this.current)) {
              var result = RegExp.lastMatch;
              var right = RegExp.rightContext;
              if (/[\n\r\u2028\u2029]/.test(result)) {
                // found LineTerminator
                this.hasLineTerminatorBeforeNext = true;
              }
              this.current = right;
            } else {
              token = ILLEGAL;
            }
          }
        } else if (/^"((?:\\.|[^"])*)"|^'((?:\\.|[^'])*)'/.test(this.current)) {
          // scan string
          token = OP["STRING"];
          this.value = RegExp.$1 || RegExp.$2;
          this.current = RegExp.rightContext;
        } else if (/^(?:0x[\dA-Fa-f]+|\d+(?:\.\d*)?(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?)/.test(this.current)) {
          // scan number
          token = OP["NUMBER"];
          this.value = RegExp.lastMatch;
          this.current = RegExp.rightContext;
          if (this.current && (IdentifierStart.test(this.current) || /^\d/.test(this.current))) {
            token = ILLEGAL;
          }
        } else if (/^(?:===|!==|>>>=|>>>|>>=|<<=|\-\-|\+\+|>>|\|\||\|=|\^=|>=|==|<=|&=|&&|!=|\+=|\/=|\-=|\*=|%=|<<|\}|\||\{|\^|\[|\?|=|;|:|,|\(|&|!|~|\+|\-|>|<|\]|\/|\.|\*|\)|%)/.test(this.current)) {
          token = OP[RegExp.lastMatch];
          this.current = RegExp.rightContext;
        } else if (IdentifierStart.test(this.current)) {
          // scan identifier
          this.value = this.current.match(IdentifierPart)[1];
          token = KEYWORDS[this.value] === IDENT ? OP[this.value] : OP["IDENTIFIER"];
          this.current = RegExp.rightContext;
        } else if (LineTerminator.test(this.current)) {
          // scan line terminator
          var num = RegExp.lastMatch;
          this.current = RegExp.rightContext;
          this.hasLineTerminatorBeforeNext = true;
        } else {
          token = ILLEGAL;
        }
      } else {
        token = EOS;
      }
    } while(token === NOTFOUND);
    return token;
  };
  Lexer.prototype.scanRegExpLiteral = function(seenEqual) {
    if (seenEqual) {
      var result = '=';
      if (/^((?:\\.|\[(?:\\.|[^\]])*\]|[^\/])+)\//.test(this.current)) {
        this.value = '=' + RegExp.$1;
        this.current = RegExp.rightContext;
      } else {
        return false;
      }
    } else {
      if (/^((?:\\.|\[(?:\\.|[^\]])*\]|[^\/])+)\//.test(this.current)) {
        this.value = RegExp.$1;
        this.current = RegExp.rightContext;
      } else {
        return false;
      }
    }
    return true;
  };
  Lexer.prototype.scanRegExpFlags = function() {
    if (/(?:[_$\da-zA-Z]|\\\u[\da-fA-F]{4})*/.test(this.current)) {
      this.value = RegExp.lastMatch;
      this.current = RegExp.rightContext;
      return true;
    } else {
      return false;
    }
  };

  Parser = function Parser(source) {
    this.lexer = new Lexer(source);
    this.next();
  };
  Parser.prototype.parse = function() {
    var global = {
      type : "global",
      body : []
    };
    this.parseSourceElements(EOS, global);
    return global;
  };
  Parser.prototype.next = function() {
    return this.token = this.lexer.next();
  };
  Parser.prototype.parseSourceElements = function(end, func) {
    while (this.token !== end) {
      if (this.token === OP["function"]) {
        // parse function declaration
        var stmt = this.parseFunctionDeclaration();
        func.body.push(stmt);
      } else {
        var stmt = this.parseStatement();
        func.body.push(stmt);
      }
    }
  }
  Parser.prototype.parseStatement = function() {
    if (this.token === ILLEGAL) {
      throw new Error("ILLEGAL");
    }
    switch (this.token) {
      case OP["{"]:
        // block
        return this.parseBlock();

      case OP["const"]:
      case OP["var"]:
        return this.parseVariableStatement();

      case OP[";"]:
        this.next();
        return {type:"EmptyStatement"};

      case OP["if"]:
        return this.parseIfStatement();

      case OP["do"]:
        return this.parseDoWhileStatement();

      case OP["while"]:
        return this.parseWhileStatement();

      case OP["for"]:
        return this.parseForStatement();

      case OP["continue"]:
        return this.parseContinueStatement();

      case OP["break"]:
        return this.parseBreakStatement();

      case OP["return"]:
        return this.parseReturnStatement();

      case OP["with"]:
        return this.parseWithStatement();

      case OP["switch"]:
        return this.parseSwitchStatement();

      case OP["throw"]:
        return this.parseThrowStatement();

      case OP["try"]:
        return this.parseTryStatement();

      case OP["debugger"]:
        this.next();
        this.expectSemicolon();
        return {type: "DebuggerStatement"};

      case OP["function"]:
        return this.parseFunctionStatement();

      default:
        return this.parseExpressionOrLabelledStatement();
    }
    return null;
  };
  Parser.prototype.expectSemicolon = function() {
    if (this.token === OP[";"]) {
      this.next();
      return true;
    }
    if (this.lexer.hasLineTerminatorBeforeNext ||
        this.token === OP["}"] ||
        this.token === EOS) {
      return true;
    }
    throw new Error("ILLEGAL");
  };
  Parser.prototype.expect = function(ex) {
    if (this.token !== ex) {
      throw new Error("ILLEGAL");
    }
    this.next();
  };
  Parser.prototype.parseFunctionDeclaration = function() {
    this.next();
    if (this.token === OP["IDENTIFIER"]) {
      return {
        type: "FunctionDeclaration",
        func: this.parseFunctionLiteral(DECL, true)
      };
    } else {
      throw new Error("ILLEGAL");
    }
  };
  Parser.prototype.parseFunctionStatement = function() {
    this.next();
    if (this.token === OP["IDENTIFIER"]) {
      return {
        type: "FunctionStatement",
        func: this.parseFunctionLiteral(STMT, true)
      };
    } else {
      throw new Error("ILLEGAL");
    }
  };
  Parser.prototype.parseBlock = function() {
    this.next();
    var block = {
      type: "Block",
      body: []
    };
    while (this.token !== OP["}"]) {
      block.body.push(this.parseStatement());
    }
    this.next();
    return block;
  };
  Parser.prototype.parseVariableStatement = function() {
    var res = {
      type: "VariableStatement",
      decl: Lexer.opToString(this.token),
      body: []
    };
    this.parseVariableDeclarations(res);
    this.expectSemicolon();
    return res;
  };
  Parser.prototype.parseVariableDeclarations = function(res) {
    do {
      this.next();
      if (this.token !== OP["IDENTIFIER"]) {
        throw new Error("ILLEGAL");
      }
      var name = {type: "Identifier", value: this.lexer.value};
      this.next();
      if (this.token === OP["="]) {
        this.next();
        var expr = this.parseAssignmentExpression(true);
        var decl = {
          type: "Declaration",
          key: name,
          val: expr
        };
      } else {
        var decl = {
          type: "Declaration",
          key: name,
          val: { type: "Undefined" }
        };
      }
      res.body.push(decl);
    } while (this.token === OP[","]);
  };
  Parser.prototype.parseContinueStatement = function() {
    this.next();
    var stmt = {
      type: "ContinueStatement",
      label: null
    };
    if (!this.lexer.hasLineTerminatorBeforeNext &&
        this.token !== OP[";"] &&
        this.token !== OP["}"] &&
        this.token !== EOS) {
      if (this.token === OP["IDENTIFIER"]) {
        stmt.label = {
          type: "Identifier",
          value: this.lexer.value
        };
      } else {
        throw new Error("ILLEGAL");
      }
    }
    this.expectSemicolon();
    return stmt;
  };
  Parser.prototype.parseIfStatement = function() {
    this.next();
    this.expect(OP["("]);
    var expr = this.parseExpression(true);
    this.expect(OP[")"]);
    var stmt = this.parseStatement();
    var res = {
      type : "IfStatement",
      cond : expr,
      then : stmt
    };
    if (this.token === OP["else"]) {
      this.next();
      res["else"] = this.parseStatement();
    }
    return res;
  };
  Parser.prototype.parseDoWhileStatement = function() {
    this.next();
    var stmt = this.parseStatement();
    this.expect(OP["while"]);
    this.expect(OP["("]);
    var expr = this.parseExpression(true);
    this.expect(OP[")"]);
    this.expectSemicolon();
    return {
      type: "DoWhileStatement",
      body: stmt,
      cond: expr
    };
  };
  Parser.prototype.parseWhileStatement = function() {
    this.next();
    this.expect(OP["("]);
    var expr = this.parseExpression(true);
    this.expect(OP[")"]);
    return {
      type: "WhileStatement",
      cond: expr,
      body: this.parseStatement()
    };
  };
  Parser.prototype.parseForStatement = function() {
    this.next();
    this.expect(OP["("]);
    if (this.token !== OP[";"]) {
      if (this.token === OP["var"] || this.token === OP["const"]) {
        var init = {
          type: "VariableStatement",
          decl: Lexer.opToString(this.token),
          body: []
        };
        this.parseVariableDeclarations(init);
        if (this.token === OP["in"]) {
          this.next();
          var enumerable = this.parseExpression(true);
          this.expect(OP[")"]);
          var body = this.parseStatement();
          return {
            type: "ForInStatement",
            init: init,
            enumerable: enumerable,
            body: body
          };
        }
      } else {
        var initExpr = this.parseExpression(false);
        var init = {
          type: "ExpressionStatement",
          expr: initExpr
        };
        if (this.token === OP["in"]) {
          if (initExpr.type !== "Identifier" && initExpr.type !== "PropertyAccess") {
            throw new Error("ILLEGAL");
          }
          this.next();
          var enumerable = this.parseExpression(true);
          this.expect(OP[")"]);
          var body = this.parseStatement();
          return {
            type: "ForInStatement",
            init: init,
            enumerable: enumerable,
            body: body
          };
        }
      }
    }
    this.expect(OP[";"]);

    var cond = null;
    if (this.token === OP[";"]) {
      this.next();
    } else {
      cond = this.parseExpression(true);
      this.expect(OP[";"]);
    }

    var next = null;
    if (this.token === OP[")"]) {
      this.next();
    } else {
      var nextExpr = this.parseExpression(true);
      next = {
        type: "ExpressionStatement",
        expr: nextExpr
      };
      this.expect(OP[")"]);
    }

    var body = this.parseStatement();
    return {
      type: "ForStatement",
      init: init,
      cond: cond,
      next: next,
      body: body
    };
  };
  Parser.prototype.parseBreakStatement = function() {
    this.next();
    var stmt = {
      type: "BreakStatement",
      label: null
    };
    if (!this.lexer.hasLineTerminatorBeforeNext &&
        this.token !== OP[";"] &&
        this.token !== OP["}"] &&
        this.token !== EOS) {
      if (this.token === OP["IDENTIFIER"]) {
        stmt.label = {
          type: "Identifier",
          value: this.lexer.value
        };
      } else {
        throw new Error("ILLEGAL");
      }
    }
    this.expectSemicolon();
    return stmt;
  };
  Parser.prototype.parseReturnStatement = function() {
    this.next();
    if (this.lexer.hasLineTerminatorBeforeNext ||
        this.token === OP[";"] ||
        this.token === OP["}"] ||
        this.token === EOS) {
      this.expectSemicolon();
      return {
        type: "ReturnStatement",
        expr: { type: "Undefined" }
      };
    }
    var expr = this.parseExpression(true);
    this.expectSemicolon();
    return {
      type: "ReturnStatement",
      expr: expr
    };
  };
  Parser.prototype.parseWithStatement = function() {
    this.next();
    this.expect(OP["("]);
    var expr = this.parseExpression(true);
    this.expect(OP[")"]);
    return {
      type: "WithStatement",
      body: this.parseStatement(),
      expr: expr
    };
  };
  Parser.prototype.parseSwitchStatement = function() {
    this.next();
    this.expect(OP["("]);
    var expr = this.parseExpression(true);
    var res = {
      type: "SwitchStatement",
      expr: expr,
      clauses: []
    };
    this.expect(OP[")"]);
    this.expect(OP["{"]);

    while (this.token !== OP["}"]) {
      var clause = this.parseCaseClause();
      res.clauses.push(clause);
    }
    this.next();
    return res;
  };
  Parser.prototype.parseCaseClause = function() {
    var clause = {
      type: "Caluse",
      body: []
    };
    if (this.token === OP["case"]) {
      this.next();
      var expr = this.parseExpression(true);
      clause.kind = "case";
      clause.expr = expr;
    } else {
      this.expect(OP["default"]);
      clause.kind = "default";
    }

    this.expect(OP[":"]);

    while (this.token !== OP["}"] &&
           this.token !== OP["case"] &&
           this.token !== OP["default"]) {
      var stmt = this.parseStatement();
      clause.body.push(stmt);
    }
    return clause;
  };
  Parser.prototype.parseThrowStatement = function() {
    this.next();
    if (this.lexer.hasLineTerminatorBeforeNext) {
      throw new Error("ILLEGAL");
    }
    var expr = this.parseExpression(true);
    this.expectSemicolon();
    return {type:"ThrowStatement", expr: expr};
  };
  Parser.prototype.parseTryStatement = function() {
    var hasCatchOrFinally = false;
    this.next();

    var res = {
      type : "TryStatement",
      block: this.parseBlock()
    };

    if (this.token === OP["catch"]) {
      hasCatchOrFinally = true;
      this.next();
      this.expect(OP["("]);
      if(this.token !== OP["IDENTIFIER"]) {
        throw new Error("ILLEGAL");
      }
      var ident = {type: "Identifier", value: this.lexer.value };
      this.next();
      this.expect(OP[")"]);
      var block = this.parseBlock();
      res.catchBlock = {
        name: ident,
        block: block
      };
    }

    if (this.token === OP["finally"]) {
      hasCatchOrFinally = true;
      this.next();
      var block = this.parseBlock();
      res.finallyBlock = {
        block: block
      };
    }

    if (!hasCatchOrFinally) {
      throw new Error("ILLEGAL");
    }

    return res;
  };
  Parser.prototype.parseExpressionOrLabelledStatement = function() {
    if (this.token === OP["IDENTIFIER"]) {
      var expr = this.parseExpression(true);
      if (this.token === OP[":"] &&
          expr.type === "Identifier") {
        this.next();
        return {
          type: "LabelledStatement",
          expr: expr,
          body: this.parseStatement()
        };
      }
    } else {
      var expr = this.parseExpression(true);
    }
    this.expectSemicolon();
    return {
      type: "ExpressionStatement",
      expr: expr
    };
  };
  Parser.prototype.parseExpression = function(containsIn) {
    var result = this.parseAssignmentExpression(containsIn);
    while (this.token === OP[","]) {
      this.next();
      var right = this.parseAssignmentExpression(containsIn);
      result = {
        type: "BinaryExpression",
        op  : ",",
        left: result,
        right: right
      };
    }
    return result;
  };
  Parser.prototype.parseAssignmentExpression = function(containsIn) {
    var result = this.parseConditionalExpression(containsIn);
    if (!isAssignOp(this.token)) {
      return result;
    }
    if (result.type !== "Identifier" && result.type !== "PropertyAccess") {
      throw new Error("ILLEGAL");
    }
    var op = Lexer.opToString(this.token);
    this.next();
    var right = this.parseAssignmentExpression(containsIn);
    return {
      type: "Assignment",
      op: op,
      left: result,
      right: right
    };
  };
  Parser.prototype.parseConditionalExpression = function(containsIn) {
    var result = this.parseBinaryExpression(containsIn, 9);
    if (this.token === OP["?"]) {
      this.next();
      var left = this.parseAssignmentExpression(true);
      this.expect(OP[":"]);
      var right = this.parseAssignmentExpression(containsIn);
      result = {
        type: "ConditionalExpression",
        cond: result,
        left: left,
        right: right
      };
    }
    return result;
  };
  Parser.prototype.parseBinaryExpression = function(containsIn, prec) {
    var left = this.parseUnaryExpression();
    while (this.token === OP["*"] ||
           this.token === OP["/"] ||
           this.token === OP["%"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseUnaryExpression();
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 1) return left;

    while (this.token === OP["+"] || this.token === OP["-"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 0);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 2) return left;

    while (this.token === OP["<<"] ||
           this.token === OP[">>>"] ||
           this.token === OP[">>"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 1);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 3) return left;

    while (isRelationalOp(this.token) ||
           (containsIn && this.token === OP["in"])) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 2);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 4) return left;

    while (this.token === OP["==="] ||
           this.token === OP["!=="] ||
           this.token === OP["=="] ||
           this.token === OP["!="]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 3);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 5) return left;

    while (this.token === OP["&"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 4);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 6) return left;

    while (this.token === OP["^"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 5);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 7) return left;

    while (this.token === OP["|"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 6);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 8) return left;

    while (this.token === OP["&&"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 7);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    if (prec < 9) return left;

    while (this.token === OP["||"]) {
      var op = Lexer.opToString(this.token);
      this.next();
      var right = this.parseBinaryExpression(containsIn, 8);
      left = { type: "BinaryExpression",
        op: op, left: left, right: right
      };
    }
    return left;
  };
  Parser.prototype.parseUnaryExpression = function() {
    var op = Lexer.opToString(this.token);
    switch (this.token) {
      case OP["void"]:
      case OP["!"]:
      case OP["typeof"]:
      case OP["~"]:
      case OP["+"]:
      case OP["-"]:
      case OP["delete"]:
        this.next();
        var expr = this.parseUnaryExpression();
        return {type: "UnaryExpression", op: op, expr: expr};

      case OP["++"]:
      case OP["--"]:
        this.next();
        var expr = this.parseMemberExpression();
        if (expr.type !== "Identifier" && expr.type !== "PropertyAccess") {
          throw new Error("ILLEGAL");
        }
        return {type: "UnaryExpression", op: op, expr: expr};

      default:
        return this.parsePostfixExpression();
    }
  };
  Parser.prototype.parsePostfixExpression = function() {
    var expr = this.parseMemberExpression(true);
    if (!this.lexer.hasLineTerminatorBeforeNext &&
        (this.token === OP["++"] || this.token === OP["--"])) {
      if(expr.type !== "Identifier" && expr.type !== "PropertyAccess") {
        throw new Error("ILLEGAL");
      }
      expr = {
        type:"PostfixExpression",
        op: Lexer.opToString(this.token),
        expr: expr
      };
      this.next();
    }
    return expr;
  };
  Parser.prototype.parseMemberExpression = function(allowCall) {
    var expr = null;
    if (this.token !== OP["new"]) {
      if (this.token === OP["function"]) {
        this.next();
        expr = this.parseFunctionLiteral(EXP, true);
      } else {
        expr = this.parsePrimaryExpression();
      }
    } else {
      this.next();
      var target = this.parseMemberExpression(false);
      var expr = {
        type: "NewCall",
        target: target,
        args: []
      };
      if (this.token === OP["("]) {
        this.parseArguments(expr);
      }
    }
    while (true) {
      switch (this.token) {
        case OP["["]:
          this.next();
          var index = this.parseExpression(true);
          expr = {
            type: "PropertyAccess",
            target: expr,
            key: index
          };
          this.expect(OP["]"]);
          break;

        case OP["."]:
          this.next();
          if (this.token !== OP["IDENTIFIER"]) {
            throw new Error("ILLEGAL");
          }
          var index = {
            type: "Identifier",
            value: this.lexer.value
          };
          this.next();
          expr = {
            type: "PropertyAccess",
            target: expr,
            key: index
          };
          break;

        case OP["("]:
          if (allowCall) {
            expr = {
              type: "FuncCall",
              target: expr,
              args: []
            };
            this.parseArguments(expr);
          } else {
            return expr;
          }
          break;

        default:
          return expr;
      }
    }
  };
  Parser.prototype.parsePrimaryExpression = function() {
    switch (this.token) {
      case OP["this"]:
        this.next();
        return { type: "This" };

      case OP["IDENTIFIER"]:
        var value = this.lexer.value;
        this.next();
        return {
          type: "Identifier",
          value: value
        };

      case OP["null"]:
        this.next();
        return { type: "Null" };

      case OP["true"]:
        this.next();
        return { type: "True" };

      case OP["false"]:
        this.next();
        return { type: "False" };

      case OP["NUMBER"]:
        var value = this.lexer.value;
        this.next();
        return {
          type: "Number",
          value: value
        };

      case OP["STRING"]:
        var value = this.lexer.value;
        this.next();
        return {
          type: "String",
          value: value
        };

      case OP["/"]:
        return this.parseRegExpLiteral(false);

      case OP["/="]:
        return this.parseRegExpLiteral(true);

      case OP["["]:
        return this.parseArrayLiteral();

      case OP["{"]:
        return this.parseObjectLiteral();

      case OP["("]:
        this.next();
        var result = this.parseExpression(true);
        this.expect(OP[")"]);
        return result;

      default:
        throw new Error("ILLEGAL");
    }
  };
  Parser.prototype.parseArguments = function(func) {
    this.next();
    while (this.token !== OP[")"]) {
      var expr = this.parseAssignmentExpression(true);
      func.args.push(expr);
      if (this.token !== OP[")"]) {
        this.expect(OP[","]);
      }
    }
    this.next();
    return func;
  };
  Parser.prototype.parseRegExpLiteral = function(containsEq) {
    if (this.lexer.scanRegExpLiteral(containsEq)) {
      var expr = {
        type: "RegExp",
        value: this.lexer.value
      };
      if (!this.lexer.scanRegExpFlags()) {
        throw new Error("ILLEGAL");
      } else {
        expr.flags = this.lexer.value;
      }
      this.next();
      return expr;
    } else {
      throw new Error("ILLEGAL");
    }
  };
  Parser.prototype.parseArrayLiteral = function() {
    this.next();
    var literal = {
      type: "Array",
      items: []
    };
    while (this.token !== OP["]"]) {
      if (this.token === OP[","]) {
        literal.items.push({ type: "Undefined" });
      } else {
        literal.items.push(this.parseAssignmentExpression(true));
      }
      if (this.token !== OP["]"]) {
        this.expect(OP[","]);
      }
    }
    this.next();
    return literal;
  };
  Parser.prototype.parseObjectLiteral = function() {
    this.next();
    var literal = {
      type: "Object",
      map : {},
      accessors : []
    };
    while (this.token !== OP["}"]) {
      if (this.token == OP["IDENTIFIER"]) {
        if (this.lexer.value !== "get" && this.lexer.value !== "set") {
          var key = this.lexer.value;
          this.next();
          this.expect(OP[":"]);
          literal.map[key] = this.parseAssignmentExpression(true);
          if (this.token !== OP["}"]) {
            this.expect(OP[","]);
          }
        } else {
          var ac = this.lexer.value;
          this.next();
          if (this.token === OP[":"]) {
            this.next();
            literal.map[ac] = this.parseAssignmentExpression(true);
            if (this.token !== OP["}"]) {
              this.expect(OP[","]);
            }
          } else {
            if (this.token === OP["IDENTIFIER"] ||
                this.token === OP["STRING"] ||
                this.token === OP["NUMBER"]) {
              var name = this.lexer.value;
              this.next();
              var expr = this.parseFunctionLiteral(EXP, false);
              literal.accessors.push({
                type: "Accessor",
                kind: ac,
                name: name,
                func: expr
              });
              if (this.token !== OP["}"]) {
                this.expect(OP[","]);
              }
            } else {
              throw new Error("ILLEGAL");
            }
          }
        }
      } else if (this.token === OP["STRING"] ||
                 this.token === OP["NUMBER"]) {
        var key = this.lexer.value;
        this.next();
        this.expect(OP[":"]);
        literal.map[key] = this.parseAssignmentExpression(true);
        if (this.token !== OP["}"]) {
          this.expect(OP[","]);
        }
      } else {
        throw new Error("ILLEGAL");
      }
    }
    this.next();
    return literal;
  };
  Parser.prototype.parseFunctionLiteral = function(kind, allowIdentifier) {
    var literal = {
      type: "Function",
      kind: kind,
      params: [],
      body: []
    };
    if (allowIdentifier && this.token === OP["IDENTIFIER"]) {
      literal.name = this.lexer.value;
      this.next();
    }
    this.expect(OP["("]);
    while (this.token !== OP[")"]) {
      if (this.token !== OP["IDENTIFIER"]) {
        throw new Error("ILLEGAL");
      }
      literal.params.push({
        type: "Identifier",
        value: this.lexer.value
      });
      this.next();
      if (this.token !== OP[")"]) {
        this.expect(OP[","]);
      }
    }
    this.next();

    this.expect(OP["{"]);
    this.parseSourceElements(OP["}"], literal);
    this.next();
    return literal;
  };
})();


