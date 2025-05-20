import React from 'react'
import TarotCardFlipCanvas from '../components/TarotCardFlipCanvas'
export default function Taro() {
    const frontImage = "https://cdn.jsdelivr.net/gh/xiejiahe/image_store/img/tarot/1.png"
    const backImage = "https://cdn.jsdelivr.net/gh/xiejiahe/image_store/img/tarot/2.png"
  return (
    <div>
        <TarotCardFlipCanvas frontImage={frontImage} backImage={backImage}></TarotCardFlipCanvas>
    </div>
  )
}
