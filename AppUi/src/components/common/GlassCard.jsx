import { motion } from "framer-motion";

const GlassCard = ({
  children,
  className = "",
  variant = "default",
  hover = true,
  padding = "md",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "glass-card",
    solid: "glass-solid",
    transparent: "glass",
  };

  return (
    <motion.div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      whileHover={hover ? { scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
