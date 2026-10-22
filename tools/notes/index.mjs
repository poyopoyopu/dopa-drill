// 要点ノートを1つにまとめる(tools/build_text.mjs と tests で使う)。
import s1 from './s1.mjs';
import s2 from './s2.mjs';
import s3a from './s3a.mjs';
import s3b from './s3b.mjs';
import s4 from './s4.mjs';
import s5 from './s5.mjs';

export const NOTES = { ...s1, ...s2, ...s3a, ...s3b, ...s4, ...s5 };
