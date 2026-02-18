import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://ralithontechnologies.in/',
      lastModified: new Date(),
    }
  ]
}