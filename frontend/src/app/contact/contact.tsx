import React, { useState } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('संपर्क साधा डेटा (Submitted Contact Form):', formData);
    alert('धन्यवाद! तुमचा संदेश यशस्वीरित्या प्राप्त झाला आहे. आम्ही लवकरच तुमच्याशी संपर्क साधू. (डेटा कन्सोलमध्ये लॉग केला आहे)');
    setFormData({ name: '', mobile: '', email: '', message: '' });
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* 1. Header Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          <ImagePlaceholder 
            aspectRatio="aspect-[16/9] md:aspect-[21/9]" 
            label="संपर्क साधा मुख्य फोटो अपलोड करा"
            className="w-full min-h-[140px] sm:min-h-[220px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent flex items-end p-6 z-10">
            <div className="flex items-center gap-3">
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Grid */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Details & Map */}
          <div className="space-y-6">
            
            {/* Info Card */}
            <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 space-y-5">
              <h2 className="text-xl font-bold font-heading text-maroon border-b border-maroon/5 pb-2">
                कार्यालयीन पत्ता व संपर्क
              </h2>
              
              <ul className="space-y-4 text-sm font-body">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-saffron shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal/90">पुणे कार्यालय पत्ता:</h4>
                    {/* <p className="text-charcoal/70 mt-0.5 leading-relaxed">
                      दापोली मंडणगड सेवाभावी संस्था, पुणे कार्यालय, सदाशिव पेठ, पुणे - ४११०३०.
                    </p> */}
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <Phone size={20} className="text-saffron shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal/90">संपर्क क्रमांक:</h4>
                    {/* <p className="text-charcoal/70 mt-0.5 leading-relaxed">
                      +91 ९८७६५ ४३२१० / ९८२३४ ५६७८९
                    </p> */}
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <Mail size={20} className="text-saffron shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal/90">ईमेल पत्ता:</h4>
                    {/* <p className="text-charcoal/70 mt-0.5 leading-relaxed">
                      info@dapolimandangadngo.org
                    </p> */}
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Placeholder Box */}
            <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-maroon font-heading">नकाशा (Google Map Location)</h3>
              <ImagePlaceholder 
                aspectRatio="aspect-video" 
                label="गूगल नकाशा स्थान अपलोड करा (पुणे कार्यालय)" 
                className="w-full h-[220px]" 
              />
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8">
            <h2 className="text-xl font-bold font-heading text-maroon border-b border-maroon/5 pb-3">
              अभिप्राय / संदेश फॉर्म
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">नाव <span className="text-red-500">*</span>
</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="आपले पूर्ण नाव लिहा"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">मोबाईल क्रमांक <span className="text-red-500">*</span>
</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder="१० अंकी मोबाईल नंबर"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">ईमेल आयडी</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="उदा. name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">संदेश / विचार <span className="text-red-500">*</span>
</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="आपला संदेश किंवा चौकशी येथे सविस्तर लिहा..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-sm md:text-base shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300"
                >
                  <span>संदेश पाठवा (Send Message)</span>
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
