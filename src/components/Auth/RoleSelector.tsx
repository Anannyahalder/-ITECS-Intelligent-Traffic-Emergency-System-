/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { UserRole } from '@/src/types';
import { Card } from '@/src/components/ui';
import { ShieldAlert, Activity, Car, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  const roles: { id: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'operator',
      title: 'Traffic Operator',
      desc: 'Monitor traffic, manage signals, and coordinate emergency responses.',
      icon: ShieldAlert,
      color: 'bg-blue-600',
    },
    {
      id: 'responder',
      title: 'Emergency Responder',
      desc: 'Activate green corridors and get optimized routes for emergencies.',
      icon: Activity,
      color: 'bg-red-600',
    },
    {
      id: 'citizen',
      title: 'Citizen App',
      desc: 'Get real-time traffic alerts and plan your daily commute.',
      icon: Car,
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 mx-auto mb-6"
          >
            <ShieldAlert className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black text-gray-900 mb-4 tracking-tight"
          >
            Choose Your Interface
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 font-medium max-w-md mx-auto"
          >
            Select the role that matches your current GOAL.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <Card
                onClick={() => onSelect(role.id)}
                className="h-full p-8 flex flex-col items-center text-center cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-blue-100 group"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300",
                  role.color
                )}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{role.title}</h3>
                <p className="text-sm text-gray-500 font-medium mb-8 flex-1 leading-relaxed">
                  {role.desc}
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                  Launch Interface
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-xs text-gray-400 font-bold uppercase tracking-widest"
        >
          ITECS v1.0 • Secure Mission Control System
        </motion.p>
      </div>
    </div>
  );
};
