import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CreditCardIcon, 
  TruckIcon, 
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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
  
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Información personal
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Dirección de entrega
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: '',
    
    // Información de pago
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Opciones de entrega
    deliveryType: 'standard', // standard, express, scheduled
    scheduledDate: '',
    scheduledTime: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    
    // Simular proceso de pago
    setTimeout(() => {
      setLoading(false);
      setOrderCompleted(true);
      setStep(3);
      
      // Limpiar carrito después de completar pedido
      setTimeout(() => {
        dispatch(clearCart());
        onClose();
        setOrderCompleted(false);
        setStep(1);
      }, 3000);
    }, 2000);
  };

  const deliveryFee = total > 100 ? 0 : 12.99;
  const tax = total * 0.08;
  const finalTotal = total + deliveryFee + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-bounce-gentle">
          {/* Header */}
          <div className="bg-primary text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🛒 Finalizar Compra</h2>
              <p className="text-light">Paso {step} de 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-accent transition-colors duration-200 hover:scale-110"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                Información
              </span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                Pago
              </span>
              <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                Confirmación
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Step 1: Información de Entrega */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MapPinIcon className="h-6 w-6 text-primary mr-2" />
                    Información de Entrega
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección Completa
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Calle, número, colonia"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Entrega
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="relative">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="standard"
                          checked={formData.deliveryType === 'standard'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          formData.deliveryType === 'standard' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-primary/50'
                        }`}>
                          <div className="text-center">
                            <TruckIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <div className="font-medium">Estándar</div>
                            <div className="text-sm text-gray-500">24-48 hrs</div>
                            <div className="text-sm font-medium text-primary">
                              {total > 100 ? 'Gratis' : '$12.99'}
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="relative">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="express"
                          checked={formData.deliveryType === 'express'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          formData.deliveryType === 'express' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-primary/50'
                        }`}>
                          <div className="text-center">
                            <TruckIcon className="h-8 w-8 mx-auto mb-2 text-accent" />
                            <div className="font-medium">Express</div>
                            <div className="text-sm text-gray-500">2-4 hrs</div>
                            <div className="text-sm font-medium text-accent">$24.99</div>
                          </div>
                        </div>
                      </label>

                      <label className="relative">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="scheduled"
                          checked={formData.deliveryType === 'scheduled'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          formData.deliveryType === 'scheduled' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-primary/50'
                        }`}>
                          <div className="text-center">
                            <TruckIcon className="h-8 w-8 mx-auto mb-2 text-secondary" />
                            <div className="font-medium">Programada</div>
                            <div className="text-sm text-gray-500">Elige fecha</div>
                            <div className="text-sm font-medium text-secondary">$15.99</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones de Entrega (Opcional)
                    </label>
                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Indicaciones especiales para el delivery..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Información de Pago */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CreditCardIcon className="h-6 w-6 text-primary mr-2" />
                    Información de Pago
                  </h3>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Nota:</span> Esta es una demo. No ingreses información real de tarjetas.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Titular
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      required
                      placeholder="Como aparece en la tarjeta"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Expiración
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Métodos de Pago Aceptados</h4>
                    <div className="flex space-x-4">
                      <div className="bg-white p-2 rounded border">💳 Visa</div>
                      <div className="bg-white p-2 rounded border">💳 Mastercard</div>
                      <div className="bg-white p-2 rounded border">💳 AMEX</div>
                      <div className="bg-white p-2 rounded border">🏦 PayPal</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmación */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in text-center">
                  {orderCompleted ? (
                    <div className="py-12">
                      <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce-gentle" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        ¡Pedido Confirmado! 🎉
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación en breve.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 inline-block">
                        <p className="text-green-800 font-medium">
                          Número de pedido: #MV-{Date.now().toString().slice(-6)}
                        </p>
                        <p className="text-green-600 text-sm">
                          Tiempo estimado de entrega: 24-48 horas
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Procesando tu pedido...
                      </h3>
                      <p className="text-gray-600">
                        Por favor espera mientras confirmamos tu pago y preparamos tu pedido.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Order Summary */}
            <div className="w-80 bg-gray-50 p-6 border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item: any) => (
                  <div key={item.product.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                    <img
                      src={item.product.imageUrl || `https://via.placeholder.com/48x48/4d82bc/FFFFFF?text=${item.product.name.charAt(0)}`}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {!orderCompleted && (
            <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
              {step > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Anterior
                </button>
              )}
              
              <div className="ml-auto">
                {step < 2 ? (
                  <button
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-secondary text-white px-8 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 btn-gradient-primary"
                  >
                    Continuar
                  </button>
                ) : step === 2 ? (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
