'use client';

import PreviewButton from './PreviewButton';

// Simple client wrapper so server components can import the preview button
export default function PreviewButtonClient(props: any) {
  return <PreviewButton {...props} />;
}
