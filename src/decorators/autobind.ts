
export function AutoBind(_: any, _2: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor {
      const originalMethod = propertyDescriptor.value;
      return {
            configurable: true,
            enumerable: false,
            get() {
                  return originalMethod.bind(this);
            }
      }
}