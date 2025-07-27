import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state: any) => state.cart);
  const { user } = useAppSelector((state: any) => state.auth);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    deliveryType: 'standard',
    scheduledDate: '',
    scheduledTime: ''
  });

  const deliveryOptions = {
    standard: { name: '🚚 Entrega Estándar', time: '2-3 días', price: 0 },
    express: { name: '⚡ Entrega Express', time: '24 horas', price: 150 },
    scheduled: { name: '📅 Entrega Programada', time: 'Fecha elegida', price: 50 }
  };

  const deliveryFee = deliveryOptions[formData.deliveryType as keyof typeof deliveryOptions].price;
  const tax = total * 0.16;
  const finalTotal = total + deliveryFee + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simular procesamiento
    setTimeout(() => {
      setLoading(false);
      setOrderCompleted(true);
      dispatch(clearCart());
      setTimeout(() => {
        onClose();
        setStep(1);
        setOrderCompleted(false);
      }, 3000);
    }, 2000);
  };

  if (!isOpen) return null;

  if (orderCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in" />
        <div className="relative bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-gentle border border-default">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-main mb-2">¡Pedido Confirmado! 🎉</h3>
          <p className="text-muted mb-4">Tu pedido ha sido procesado exitosamente</p>
          <div className="text-sm text-muted">
            Cerrando automáticamente...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 md:p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-card rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[98vh] sm:max-h-[95vh] flex flex-col animate-bounce-gentle border border-default">
        {/* Header - New Color Palette */}
        <div className="bg-deep-navy text-white p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-t-xl sm:rounded-t-2xl flex-shrink-0 gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            {/* Logo real de MarVera en Checkout */}
            <img 
              src="/logomarvera.png" 
              alt="MarVera Logo" 
              className="h-8 w-auto sm:h-10 sm:w-auto max-w-[80px] sm:max-w-[100px] object-contain flex-shrink-0"
              onError={(e) => {
                // Fallback al emoji si no se encuentra la imagen
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'inline';
              }}
            />
            <span className="text-lg sm:text-2xl" style={{display: 'none'}}>🛒</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Finalizar Compra</h2>
              <p className="text-light-beige text-xs sm:text-sm md:text-base">Paso {step} de 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-accent transition-colors duration-200 hover:scale-110 self-end sm:self-auto"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-light bg-opacity-30 p-2 sm:p-3 md:p-4 flex-shrink-0 border-b border-default">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${step >= 1 ? 'text-vibrant-blue' : 'text-muted'}`}>
              <span className="hidden xs:inline">📋</span> Información
            </span>
            <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${step >= 2 ? 'text-vibrant-blue' : 'text-muted'}`}>
              <span className="hidden xs:inline">💳</span> Pago
            </span>
            <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${step >= 3 ? 'text-vibrant-blue' : 'text-muted'}`}>
              <span className="hidden xs:inline">✅</span> Confirmación
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2 sm:h-3 border border-default">
            <div 
              className="bg-vibrant-blue h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Container - Responsive Layout */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto order-2 lg:order-1">
            <div className="p-3 sm:p-4 md:p-6">
              {step === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold text-main mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-base sm:text-lg">📋</span> Información de Entrega
                  </h3>
                  
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Nombre</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Apellido</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="Tu apellido"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="+52 555 123 4567"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-main text-sm sm:text-base">📍 Dirección de Entrega</h4>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Dirección completa</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="Calle, número, colonia"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-main mb-1">Ciudad</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-main mb-1">Estado</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                          placeholder="Estado"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-main mb-1">Código Postal</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                          placeholder="00000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-main text-sm sm:text-base">🚚 Opciones de Entrega</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {Object.entries(deliveryOptions).map(([key, option]) => (
                        <label key={key} className="flex items-center p-2 sm:p-3 border border-default rounded-md sm:rounded-lg cursor-pointer hover:bg-light hover:bg-opacity-50 transition-colors">
                          <input
                            type="radio"
                            name="deliveryType"
                            value={key}
                            checked={formData.deliveryType === key}
                            onChange={handleInputChange}
                            className="text-primary flex-shrink-0"
                          />
                          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                              <span className="font-medium text-main text-sm sm:text-base truncate">{option.name}</span>
                              <span className="text-primary font-bold text-sm sm:text-base">
                                {option.price === 0 ? 'Gratis' : `$${option.price}`}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted">{option.time}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold text-main mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-base sm:text-lg">💳</span> Información de Pago
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Nombre en la tarjeta</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="Como aparece en la tarjeta"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-main mb-1">Número de tarjeta</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-main mb-1">Fecha de vencimiento</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-main mb-1">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-default rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main text-sm sm:text-base"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Security Info */}
                  <div className="bg-light bg-opacity-50 rounded-md sm:rounded-lg p-3 sm:p-4 border border-primary border-opacity-20">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-main text-sm sm:text-base">🔒 Pago Seguro</h4>
                        <p className="text-xs sm:text-sm text-muted">
                          Tus datos están protegidos con encriptación SSL de 256 bits.
                          Esta es una simulación - no se procesará ningún pago real.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold text-main mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-base sm:text-lg">✅</span> Confirmar Pedido
                  </h3>
                  
                  {/* Order Summary */}
                  <div className="bg-light bg-opacity-30 rounded-md sm:rounded-lg p-3 sm:p-4 border border-default">
                    <h4 className="font-semibold text-main mb-2 sm:mb-3 text-sm sm:text-base">📦 Resumen del Pedido</h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-main truncate pr-2">{item.product.name} x{item.quantity}</span>
                          <span className="font-medium text-main flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-default mt-2 sm:mt-3 pt-2 sm:pt-3 space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted">Subtotal:</span>
                        <span className="text-main">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted">Envío:</span>
                        <span className="text-main">${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted">IVA (16%):</span>
                        <span className="text-main">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-default pt-2">
                        <span className="text-main">Total:</span>
                        <span className="text-primary">${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-light bg-opacity-30 rounded-lg p-4 border border-default">
                    <h4 className="font-semibold text-main mb-3">📍 Información de Entrega</h4>
                    <div className="text-sm space-y-1">
                      <p className="text-main"><strong>Nombre:</strong> {formData.firstName} {formData.lastName}</p>
                      <p className="text-main"><strong>Dirección:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
                      <p className="text-main"><strong>Entrega:</strong> {deliveryOptions[formData.deliveryType as keyof typeof deliveryOptions].name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Responsive Order */}
          <div className="order-1 lg:order-2 lg:w-80 w-full bg-light bg-opacity-20 lg:border-l border-default p-3 sm:p-4 lg:p-6 flex flex-col lg:border-t-0 border-t lg:max-h-none max-h-[40vh]">
            <div className="flex-1">
              <h4 className="font-semibold text-main mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                <span className="text-sm sm:text-base">🛒</span>
                Tu Pedido
              </h4>
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 bg-background rounded-md sm:rounded-lg border border-default">
                    <div className="text-lg sm:text-xl lg:text-2xl flex-shrink-0">{item.product.imageUrl || '🐟'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-main text-xs sm:text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted">x{item.quantity}</p>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-vibrant-blue flex-shrink-0">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-default">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span className="text-main">Total:</span>
                  <span className="text-vibrant-blue">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
              {step < 3 && (
                <button
                  onClick={handleNextStep}
                  className="w-full bg-vibrant-blue text-white py-2 sm:py-3 px-3 sm:px-4 rounded-md sm:rounded-lg hover:bg-dark-blue transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Siguiente
                  <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
              
              {step === 3 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-md sm:rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? '🔄 Procesando...' : '✅ Confirmar Pedido'}
                </button>
              )}
              
              {step > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="w-full bg-background text-main py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg border border-default hover:bg-light hover:bg-opacity-50 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  Anterior
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
