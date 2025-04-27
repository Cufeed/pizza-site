            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-red-700">
                {menuItem.price} ₽
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="text-red-700 hover:text-red-800"
                >
                  -
                </button>
                <span className="mx-2">{quantity}</span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="text-red-700 hover:text-red-800"
                >
                  +
                </button>
              </div>
            </div> 