import { MongoAbility, createMongoAbility } from '@casl/ability';
import { createContextualCan } from '@casl/react';
import React, { createContext, useContext, useState, ReactNode, Consumer } from 'react';
import defineAbilitiesFor, { AppAbility } from '../permissions/permissions';


interface RoleContextProps {
  role: 'admin' | 'manager' | 'client';
  setRole: (role: 'admin' | 'manager' | 'client') => void;
  ability: AppAbility;
}


const RoleContext = createContext<RoleContextProps | undefined>(undefined);
export const Can = createContextualCan<AppAbility>(RoleContext.Consumer as unknown as Consumer<AppAbility>);

export const RoleProvider = ({ children, initialRole }: { children: ReactNode, initialRole: 'admin' | 'manager' | 'client' }) => {
  const [role, setRole] = useState<'admin' | 'manager' | 'client'>(initialRole);
  const ability = defineAbilitiesFor(role);
  return (
    <RoleContext.Provider value={{ role, ability, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    return {
      role: 'client',
      ability: createMongoAbility<MongoAbility>([]),
      setRole: () => {}
    }
  }
  return context;
};
