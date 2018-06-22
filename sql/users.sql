/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : pacsdb

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2018-06-22 11:52:42
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `user_id` varchar(250) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `roles` varchar(250) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  KEY `roles_user_id` (`user_id`),
  CONSTRAINT `roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES ('admin', 'JBossAdmin');
INSERT INTO `roles` VALUES ('admin', 'WebAdmin');
INSERT INTO `roles` VALUES ('admin', 'WebUser');
INSERT INTO `roles` VALUES ('admin', 'McmUser');
INSERT INTO `roles` VALUES ('admin', 'AuditLogUser');
INSERT INTO `roles` VALUES ('admin', 'Doctor');
INSERT INTO `roles` VALUES ('user', 'WebUser');
INSERT INTO `roles` VALUES ('user', 'McmUser');
INSERT INTO `roles` VALUES ('user', 'Doctor');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` varchar(250) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `passwd` varchar(250) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('admin', '0DPiKuNIrrVmD8IUCuw1hQxNqZc=');
INSERT INTO `users` VALUES ('user', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
SET FOREIGN_KEY_CHECKS=1;
