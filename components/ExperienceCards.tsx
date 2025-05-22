"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const projects = [
  {
    title: 'Kindle Style Mobile App',
    role: 'Full-Stack Developer',
    period: '2025',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    image: '/Experience/Mobile.PNG',
  },
  {
    title: 'E-commerce platform with CMS 🌍',
    role: 'Full Stack Developer',
    period: '2024',
    gradient: 'from-green-400 via-lime-400 to-yellow-300',
    image: '/Experience/ecommerce.png',
  },
  {
    title: 'Marketing Website',
    role: 'UI Developer',
    period: '2025',
    gradient: 'from-sky-500 via-cyan-400 to-emerald-400',
    image: '/Experience/Destani.png',
  },
  {
    title: 'NGO Website',
    role: 'Full Stack Developer',
    period: '2024',
    gradient: 'from-pink-400 via-red-400 to-orange-300',
    image: '/Kotgep.png',
  },
];

// Animasyon variantları
const cardVariants = {
  offscreen: {
    opacity: 0,
    scale: 0.9,
    y: 40,
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.2,
      duration: 0.8,
    },
  },
};

function ExperienceCards() {
  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 px-4"
    >
      {projects.map((project, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{
            scale: 1.03,
            y: -5,
            transition: { duration: 0.3 },
          }}
          className="bg-neutral-900 rounded-3xl p-6 shadow-xl"
        >
          <div
            className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${project.gradient} overflow-hidden flex items-center justify-center`}
          >
            <div className="p-4 w-full h-full">
              <Image
                src={project.image}
                alt={project.title}
                width={800}
                height={450}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
          <h3 className="text-xl font-medium text-white mt-4">
            {project.title}
          </h3>
          <p className="text-neutral-400 text-sm font-light">{project.role}</p>
          <p className="text-neutral-500 text-sm font-light mt-1">
            / {project.period}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ExperienceCards;