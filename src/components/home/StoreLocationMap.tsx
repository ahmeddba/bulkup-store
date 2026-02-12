"use client"



export function StoreLocationMap() {
  const googleMapsUrl = "https://www.google.com/maps/place/Bulkup+store/@36.9001769,10.1860537,17z/data=!3m1!4b1!4m6!3m5!1s0x12e2cbdb800e0c75:0x61de9973afff2970!8m2!3d36.9001769!4d10.1860537!16s%2Fg%2F11xyp8__x8?entry=ttu&g_ep=EgoyMDI2MDIwNC4wIKXMDSoASAFQAw%3D%3D"
  
  // Static Google Maps image URL with marker
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=36.9001769,10.1860537&zoom=15&size=600x400&markers=color:yellow%7C36.9001769,10.1860537&style=feature:all%7Celement:geometry%7Ccolor:0x242f3e&style=feature:all%7Celement:labels.text.stroke%7Ccolor:0x242f3e&style=feature:all%7Celement:labels.text.fill%7Ccolor:0x746855&style=feature:water%7Celement:geometry%7Ccolor:0x17263c&key=YOUR_API_KEY`

  return (
    <a 
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-white/10 transition-all hover:border-primary/50"
    >
      {/* Embedded iframe map */}
      <div className="relative h-64 w-full overflow-hidden bg-[#1a1a1a]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.0844444444445!2d10.183664815!3d36.9001769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e2cbdb800e0c75%3A0x61de9973afff2970!2sBulkup%20store!5e0!3m2!1sen!2stn!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none"
        />
      </div>
      
      {/* Overlay with click hint */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
        <div className="translate-y-10 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <div className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-black shadow-glow-yellow">
            📍 Ouvrir dans Google Maps
          </div>
        </div>
      </div>
      
      {/* Store address overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-sm font-extrabold text-white">Bulkup Store</p>
        <p className="text-xs font-semibold text-white/55">Cliquez pour obtenir l'itinéraire</p>
      </div>
    </a>
  )
}
