/**
 * Hero headline with a word-by-word rise.
 *
 * A SERVER COMPONENT — the stagger is CSS, so no animation library reaches
 * the critical path and no hydration is needed for the page's most important
 * text. Per-word delay is passed as a custom property.
 *
 * Visible words are aria-hidden and the full sentence is exposed once as
 * sr-only text, so assistive tech reads one heading rather than nine
 * disconnected fragments.
 *
 * Reduced motion is handled by the global backstop in globals.css, which
 * zeroes both duration and delay — words land instantly at their final state.
 */
export function HeroHeadline({ words }: { words: readonly string[] }) {
  const sentence = words.join(" ")

  return (
    <h1 className="font-heading text-display leading-[1.05] font-semibold tracking-tight text-balance">
      <span className="sr-only">{sentence}</span>

      <span aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <span
              className="animate-rise inline-block"
              style={{ "--delay": `${i * 40}ms` } as React.CSSProperties}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </h1>
  )
}
