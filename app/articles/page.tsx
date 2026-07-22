import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
const articles=[
  ["brand-signal","How to turn a brand promise into a digital signal","Strategy","A practical way to make positioning visible in the moments that influence choice."],
  ["website-clarity","Five signs your website is making visitors work too hard","Experience","Clarity is not less personality. It is a faster route to the value your brand creates."],
  ["growth-system","Why the best growth campaigns start before the first ad","Growth","A connected view of message, landing experience, content, and measurement."],
];
export default function Articles(){return <SiteShell><section className="inner-hero compact"><div className="wrap"><p className="eyebrow">INSIGHTS</p><h1>Useful thinking for<br/>brands in <i>motion.</i></h1><p>Notes on strategy, experience, and sustainable digital growth.</p></div></section><section className="wrap section article-grid">{articles.map(([slug,title,topic,copy],i)=><article key={slug}><div className={`article-art art-${i+1}`}><span>0{i+1}</span></div><p className="eyebrow">{topic}</p><h2>{title}</h2><p>{copy}</p><Link href={`/articles/${slug}`} className="text-link">Read article -&gt;</Link></article>)}</section></SiteShell>}
