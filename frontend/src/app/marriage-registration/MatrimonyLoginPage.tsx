import React from 'react';
import { useNavigate } from 'react-router-dom';
import MatrimonyLoginModal from '../../components/MatrimonyLoginModal';

export const MatrimonyLoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-cream/30">
      <MatrimonyLoginModal
        isOpen={true}
        onClose={() => navigate('/marriage-registration')}
        onSuccess={() => navigate('/marriage-registration')}
      />
    </div>
  );
};

export default MatrimonyLoginPage;
