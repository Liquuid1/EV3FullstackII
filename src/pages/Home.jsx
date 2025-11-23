import React from 'react'
import { HeroSection } from '../components/home/HeroSection'
import { ProductPreview } from '../components/home/ProductPreview'
import { BlogPreview } from '../components/home/BlogPreview'
import { SubscriptionForm } from '../components/home/SubscriptionForm'
import { AboutTeaser } from '../components/home/AboutTeaser'

export const Home = () => {
  return (
    <div>
      <HeroSection />
      <ProductPreview />
      <BlogPreview />
      <SubscriptionForm />
      <AboutTeaser />
    </div>
  )
}
