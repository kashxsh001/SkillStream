import React from 'react'

export default function AboutPage() {
  return (
    <div className="container">
      <div className="hero" style={{textAlign:'left'}}>
        <h2 className="hero-title" style={{fontSize:32}}>About Skillstream</h2>
        <p className="hero-subtitle" style={{fontSize:18}}>
          No more paid courses — learn everything for free. Skillstream aggregates quality
          learning resources, so you can discover and track the best content on the web.
        </p>
      </div>
      <div style={{marginTop: 40, display: 'grid', gap: 24}}>
        <div className="card" style={{padding: 24}}>
          <h3 style={{margin: '0 0 12px', fontSize: 20}}>Our Mission</h3>
          <p style={{margin: 0, color: 'var(--text-muted)', lineHeight: 1.6}}>
            We believe education should be accessible to everyone. Skillstream curates the best free courses
            from across the internet, making it easy to find and organize your learning journey.
          </p>
        </div>
        <div className="card" style={{padding: 24}}>
          <h3 style={{margin: '0 0 12px', fontSize: 20}}>How It Works</h3>
          <p style={{margin: 0, color: 'var(--text-muted)', lineHeight: 1.6}}>
            Browse thousands of free courses, filter by tags, save your favorites, and track your progress.
            All courses are carefully selected to ensure quality and relevance.
          </p>
        </div>
      </div>
    </div>
  )
}


