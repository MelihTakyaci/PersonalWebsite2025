"use client";
import { motion } from 'framer-motion';

const projects = [
  {
    title: 'Crypto Trading App 📈',
    role: 'Full-Stack Developer',
    period: '2024',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
  },
  {
    title: 'Embedded Dashboard ⚙️',
    role: 'UI Developer for ESP32',
    period: '2023',
    gradient: 'from-green-400 via-lime-400 to-yellow-300',
  },
  {
    title: 'Open Data Portal 🌍',
    role: 'Frontend + API',
    period: '2023',
    gradient: 'from-sky-500 via-cyan-400 to-emerald-400',
  },
  {
    title: 'Health Data Analysis 🧠',
    role: 'Data Visualization / Power BI',
    period: '2022',
    gradient: 'from-pink-400 via-red-400 to-orange-300',
  },
];

function ExperienceCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 px-4">
      {projects.map((project, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-neutral-900 rounded-3xl p-6 shadow-xl"
        >
          <div
            className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${project.gradient} mb-4`}
          ></div>
          <h3 className="text-xl font-medium text-white mb-1">
            {project.title}
          </h3>
          <p className="text-neutral-400 text-sm font-light">
            {project.role}
          </p>
          <p className="text-neutral-500 text-sm font-light mt-1">
            / {project.period}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default ExperienceCards;