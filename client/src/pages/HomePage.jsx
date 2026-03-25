import UnicornScene from "unicornstudio-react";
import AIChatbot from '../components/AIChatbot.jsx'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#9da396]">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full min-w-[1920px] min-h-[1080px] flex items-center justify-center">
          <UnicornScene 
            projectId="Q3HBD0Q7837cGpO3TUrI" 
            width={1920} 
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Optional: Add a subtle overlay if needed to match the Header's aesthetic */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <AIChatbot />
    </div>
  )
}
