-- MySQL dump 10.13  Distrib 5.7.18, for Linux (x86_64)
--
-- Host: localhost    Database: mrc_db4
-- ------------------------------------------------------
-- Server version	5.7.18-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alleles`
--

DROP TABLE IF EXISTS `alleles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alleles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=343 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `arenas`
--

DROP TABLE IF EXISTS `arenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `arenas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `first_name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `last_name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chromosomes`
--

DROP TABLE IF EXISTS `chromosomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chromosomes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `developmental_stages`
--

DROP TABLE IF EXISTS `developmental_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `developmental_stages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext COLLATE utf8_unicode_ci NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exit_flags`
--

DROP TABLE IF EXISTS `exit_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exit_flags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experimenters`
--

DROP TABLE IF EXISTS `experimenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `experimenters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experiments`
--

DROP TABLE IF EXISTS `experiments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `experiments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `base_name` varchar(200) NOT NULL,
  `date` datetime DEFAULT NULL,
  `strain_id` int(11) DEFAULT NULL,
  `tracker_id` int(11) DEFAULT NULL,
  `sex_id` int(11) DEFAULT NULL,
  `developmental_stage_id` int(11) DEFAULT NULL,
  `ventral_side_id` int(11) DEFAULT NULL,
  `food_id` int(11) DEFAULT NULL,
  `arena_id` int(11) DEFAULT NULL,
  `habituation_id` int(11) DEFAULT NULL,
  `experimenter_id` int(11) DEFAULT NULL,
  `original_video` varchar(700) NOT NULL,
  `original_video_sizeMB` float DEFAULT NULL,
  `exit_flag_id` int(11) NOT NULL DEFAULT '0',
  `results_dir` varchar(200) DEFAULT NULL,
  `youtube_id` varchar(40) DEFAULT NULL,
  `zenodo_id` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `base_name` (`base_name`),
  UNIQUE KEY `original_video` (`original_video`),
  KEY `strain_id` (`strain_id`),
  KEY `tracker_id` (`tracker_id`),
  KEY `sex_id` (`sex_id`),
  KEY `developmental_stage_id` (`developmental_stage_id`),
  KEY `ventral_side_id` (`ventral_side_id`),
  KEY `food_id` (`food_id`),
  KEY `arena_id` (`arena_id`),
  KEY `habituation_id` (`habituation_id`),
  KEY `experimenter_id` (`experimenter_id`),
  KEY `exit_flag_id` (`exit_flag_id`),
  CONSTRAINT `experiments_ibfk_1` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`),
  CONSTRAINT `experiments_ibfk_10` FOREIGN KEY (`exit_flag_id`) REFERENCES `exit_flags` (`id`),
  CONSTRAINT `experiments_ibfk_2` FOREIGN KEY (`tracker_id`) REFERENCES `trackers` (`id`),
  CONSTRAINT `experiments_ibfk_3` FOREIGN KEY (`sex_id`) REFERENCES `sexes` (`id`),
  CONSTRAINT `experiments_ibfk_4` FOREIGN KEY (`developmental_stage_id`) REFERENCES `developmental_stages` (`id`),
  CONSTRAINT `experiments_ibfk_5` FOREIGN KEY (`ventral_side_id`) REFERENCES `ventral_sides` (`id`),
  CONSTRAINT `experiments_ibfk_6` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`),
  CONSTRAINT `experiments_ibfk_7` FOREIGN KEY (`arena_id`) REFERENCES `arenas` (`id`),
  CONSTRAINT `experiments_ibfk_8` FOREIGN KEY (`habituation_id`) REFERENCES `habituations` (`id`),
  CONSTRAINT `experiments_ibfk_9` FOREIGN KEY (`experimenter_id`) REFERENCES `experimenters` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14850 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `experiments_full`
--

DROP TABLE IF EXISTS `experiments_full`;
/*!50001 DROP VIEW IF EXISTS `experiments_full`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `experiments_full` AS SELECT 
 1 AS `id`,
 1 AS `base_name`,
 1 AS `date`,
 1 AS `original_video`,
 1 AS `original_video_sizeMB`,
 1 AS `results_dir`,
 1 AS `strain`,
 1 AS `strain_description`,
 1 AS `allele`,
 1 AS `gene`,
 1 AS `chromosome`,
 1 AS `tracker`,
 1 AS `sex`,
 1 AS `developmental_stage`,
 1 AS `ventral_side`,
 1 AS `food`,
 1 AS `habituation`,
 1 AS `experimenter`,
 1 AS `arena`,
 1 AS `exit_flag`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `features_means`
--

DROP TABLE IF EXISTS `features_means`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `features_means` (
  `experiment_id` int(11) DEFAULT NULL,
  `worm_index` float DEFAULT NULL,
  `n_frames` float DEFAULT NULL,
  `n_valid_skel` float DEFAULT NULL,
  `first_frame` float DEFAULT NULL,
  `worm_dwelling` float DEFAULT NULL,
  `head_dwelling` float DEFAULT NULL,
  `midbody_dwelling` float DEFAULT NULL,
  `tail_dwelling` float DEFAULT NULL,
  `length` float DEFAULT NULL,
  `length_forward` float DEFAULT NULL,
  `length_paused` double DEFAULT NULL,
  `length_backward` double DEFAULT NULL,
  `head_width` float DEFAULT NULL,
  `head_width_forward` float DEFAULT NULL,
  `head_width_paused` double DEFAULT NULL,
  `head_width_backward` double DEFAULT NULL,
  `midbody_width` float DEFAULT NULL,
  `midbody_width_forward` float DEFAULT NULL,
  `midbody_width_paused` double DEFAULT NULL,
  `midbody_width_backward` double DEFAULT NULL,
  `tail_width` float DEFAULT NULL,
  `tail_width_forward` float DEFAULT NULL,
  `tail_width_paused` double DEFAULT NULL,
  `tail_width_backward` double DEFAULT NULL,
  `area` float DEFAULT NULL,
  `area_forward` float DEFAULT NULL,
  `area_paused` double DEFAULT NULL,
  `area_backward` double DEFAULT NULL,
  `area_length_ratio` float DEFAULT NULL,
  `area_length_ratio_forward` float DEFAULT NULL,
  `area_length_ratio_paused` double DEFAULT NULL,
  `area_length_ratio_backward` double DEFAULT NULL,
  `width_length_ratio` float DEFAULT NULL,
  `width_length_ratio_forward` float DEFAULT NULL,
  `width_length_ratio_paused` double DEFAULT NULL,
  `width_length_ratio_backward` double DEFAULT NULL,
  `head_bend_mean` float DEFAULT NULL,
  `head_bend_mean_abs` float DEFAULT NULL,
  `head_bend_mean_neg` float DEFAULT NULL,
  `head_bend_mean_pos` float DEFAULT NULL,
  `head_bend_mean_forward` float DEFAULT NULL,
  `head_bend_mean_forward_abs` float DEFAULT NULL,
  `head_bend_mean_forward_neg` float DEFAULT NULL,
  `head_bend_mean_forward_pos` float DEFAULT NULL,
  `head_bend_mean_paused` double DEFAULT NULL,
  `head_bend_mean_paused_abs` double DEFAULT NULL,
  `head_bend_mean_paused_neg` double DEFAULT NULL,
  `head_bend_mean_paused_pos` double DEFAULT NULL,
  `head_bend_mean_backward` double DEFAULT NULL,
  `head_bend_mean_backward_abs` double DEFAULT NULL,
  `head_bend_mean_backward_neg` double DEFAULT NULL,
  `head_bend_mean_backward_pos` double DEFAULT NULL,
  `neck_bend_mean` float DEFAULT NULL,
  `neck_bend_mean_abs` float DEFAULT NULL,
  `neck_bend_mean_neg` float DEFAULT NULL,
  `neck_bend_mean_pos` float DEFAULT NULL,
  `neck_bend_mean_forward` float DEFAULT NULL,
  `neck_bend_mean_forward_abs` float DEFAULT NULL,
  `neck_bend_mean_forward_neg` double DEFAULT NULL,
  `neck_bend_mean_forward_pos` float DEFAULT NULL,
  `neck_bend_mean_paused` double DEFAULT NULL,
  `neck_bend_mean_paused_abs` double DEFAULT NULL,
  `neck_bend_mean_paused_neg` double DEFAULT NULL,
  `neck_bend_mean_paused_pos` double DEFAULT NULL,
  `neck_bend_mean_backward` double DEFAULT NULL,
  `neck_bend_mean_backward_abs` double DEFAULT NULL,
  `neck_bend_mean_backward_neg` double DEFAULT NULL,
  `neck_bend_mean_backward_pos` double DEFAULT NULL,
  `midbody_bend_mean` float DEFAULT NULL,
  `midbody_bend_mean_abs` float DEFAULT NULL,
  `midbody_bend_mean_neg` float DEFAULT NULL,
  `midbody_bend_mean_pos` float DEFAULT NULL,
  `midbody_bend_mean_forward` float DEFAULT NULL,
  `midbody_bend_mean_forward_abs` float DEFAULT NULL,
  `midbody_bend_mean_forward_neg` double DEFAULT NULL,
  `midbody_bend_mean_forward_pos` float DEFAULT NULL,
  `midbody_bend_mean_paused` double DEFAULT NULL,
  `midbody_bend_mean_paused_abs` double DEFAULT NULL,
  `midbody_bend_mean_paused_neg` double DEFAULT NULL,
  `midbody_bend_mean_paused_pos` double DEFAULT NULL,
  `midbody_bend_mean_backward` double DEFAULT NULL,
  `midbody_bend_mean_backward_abs` double DEFAULT NULL,
  `midbody_bend_mean_backward_neg` double DEFAULT NULL,
  `midbody_bend_mean_backward_pos` double DEFAULT NULL,
  `hips_bend_mean` float DEFAULT NULL,
  `hips_bend_mean_abs` float DEFAULT NULL,
  `hips_bend_mean_neg` float DEFAULT NULL,
  `hips_bend_mean_pos` float DEFAULT NULL,
  `hips_bend_mean_forward` float DEFAULT NULL,
  `hips_bend_mean_forward_abs` float DEFAULT NULL,
  `hips_bend_mean_forward_neg` double DEFAULT NULL,
  `hips_bend_mean_forward_pos` float DEFAULT NULL,
  `hips_bend_mean_paused` double DEFAULT NULL,
  `hips_bend_mean_paused_abs` double DEFAULT NULL,
  `hips_bend_mean_paused_neg` double DEFAULT NULL,
  `hips_bend_mean_paused_pos` double DEFAULT NULL,
  `hips_bend_mean_backward` double DEFAULT NULL,
  `hips_bend_mean_backward_abs` double DEFAULT NULL,
  `hips_bend_mean_backward_neg` double DEFAULT NULL,
  `hips_bend_mean_backward_pos` double DEFAULT NULL,
  `tail_bend_mean` float DEFAULT NULL,
  `tail_bend_mean_abs` float DEFAULT NULL,
  `tail_bend_mean_neg` float DEFAULT NULL,
  `tail_bend_mean_pos` float DEFAULT NULL,
  `tail_bend_mean_forward` float DEFAULT NULL,
  `tail_bend_mean_forward_abs` float DEFAULT NULL,
  `tail_bend_mean_forward_neg` double DEFAULT NULL,
  `tail_bend_mean_forward_pos` float DEFAULT NULL,
  `tail_bend_mean_paused` double DEFAULT NULL,
  `tail_bend_mean_paused_abs` double DEFAULT NULL,
  `tail_bend_mean_paused_neg` double DEFAULT NULL,
  `tail_bend_mean_paused_pos` double DEFAULT NULL,
  `tail_bend_mean_backward` double DEFAULT NULL,
  `tail_bend_mean_backward_abs` double DEFAULT NULL,
  `tail_bend_mean_backward_neg` double DEFAULT NULL,
  `tail_bend_mean_backward_pos` double DEFAULT NULL,
  `head_bend_sd` float DEFAULT NULL,
  `head_bend_sd_abs` float DEFAULT NULL,
  `head_bend_sd_neg` float DEFAULT NULL,
  `head_bend_sd_pos` float DEFAULT NULL,
  `head_bend_sd_forward` float DEFAULT NULL,
  `head_bend_sd_forward_abs` float DEFAULT NULL,
  `head_bend_sd_forward_neg` float DEFAULT NULL,
  `head_bend_sd_forward_pos` float DEFAULT NULL,
  `head_bend_sd_paused` double DEFAULT NULL,
  `head_bend_sd_paused_abs` double DEFAULT NULL,
  `head_bend_sd_paused_neg` double DEFAULT NULL,
  `head_bend_sd_paused_pos` double DEFAULT NULL,
  `head_bend_sd_backward` double DEFAULT NULL,
  `head_bend_sd_backward_abs` double DEFAULT NULL,
  `head_bend_sd_backward_neg` double DEFAULT NULL,
  `head_bend_sd_backward_pos` double DEFAULT NULL,
  `neck_bend_sd` float DEFAULT NULL,
  `neck_bend_sd_abs` float DEFAULT NULL,
  `neck_bend_sd_neg` float DEFAULT NULL,
  `neck_bend_sd_pos` float DEFAULT NULL,
  `neck_bend_sd_forward` float DEFAULT NULL,
  `neck_bend_sd_forward_abs` float DEFAULT NULL,
  `neck_bend_sd_forward_neg` double DEFAULT NULL,
  `neck_bend_sd_forward_pos` float DEFAULT NULL,
  `neck_bend_sd_paused` double DEFAULT NULL,
  `neck_bend_sd_paused_abs` double DEFAULT NULL,
  `neck_bend_sd_paused_neg` double DEFAULT NULL,
  `neck_bend_sd_paused_pos` double DEFAULT NULL,
  `neck_bend_sd_backward` double DEFAULT NULL,
  `neck_bend_sd_backward_abs` double DEFAULT NULL,
  `neck_bend_sd_backward_neg` double DEFAULT NULL,
  `neck_bend_sd_backward_pos` double DEFAULT NULL,
  `midbody_bend_sd` float DEFAULT NULL,
  `midbody_bend_sd_abs` float DEFAULT NULL,
  `midbody_bend_sd_neg` float DEFAULT NULL,
  `midbody_bend_sd_pos` float DEFAULT NULL,
  `midbody_bend_sd_forward` float DEFAULT NULL,
  `midbody_bend_sd_forward_abs` float DEFAULT NULL,
  `midbody_bend_sd_forward_neg` double DEFAULT NULL,
  `midbody_bend_sd_forward_pos` float DEFAULT NULL,
  `midbody_bend_sd_paused` double DEFAULT NULL,
  `midbody_bend_sd_paused_abs` double DEFAULT NULL,
  `midbody_bend_sd_paused_neg` double DEFAULT NULL,
  `midbody_bend_sd_paused_pos` double DEFAULT NULL,
  `midbody_bend_sd_backward` double DEFAULT NULL,
  `midbody_bend_sd_backward_abs` double DEFAULT NULL,
  `midbody_bend_sd_backward_neg` double DEFAULT NULL,
  `midbody_bend_sd_backward_pos` double DEFAULT NULL,
  `hips_bend_sd` float DEFAULT NULL,
  `hips_bend_sd_abs` float DEFAULT NULL,
  `hips_bend_sd_neg` float DEFAULT NULL,
  `hips_bend_sd_pos` float DEFAULT NULL,
  `hips_bend_sd_forward` float DEFAULT NULL,
  `hips_bend_sd_forward_abs` float DEFAULT NULL,
  `hips_bend_sd_forward_neg` double DEFAULT NULL,
  `hips_bend_sd_forward_pos` float DEFAULT NULL,
  `hips_bend_sd_paused` double DEFAULT NULL,
  `hips_bend_sd_paused_abs` double DEFAULT NULL,
  `hips_bend_sd_paused_neg` double DEFAULT NULL,
  `hips_bend_sd_paused_pos` double DEFAULT NULL,
  `hips_bend_sd_backward` double DEFAULT NULL,
  `hips_bend_sd_backward_abs` double DEFAULT NULL,
  `hips_bend_sd_backward_neg` double DEFAULT NULL,
  `hips_bend_sd_backward_pos` double DEFAULT NULL,
  `tail_bend_sd` float DEFAULT NULL,
  `tail_bend_sd_abs` float DEFAULT NULL,
  `tail_bend_sd_neg` float DEFAULT NULL,
  `tail_bend_sd_pos` float DEFAULT NULL,
  `tail_bend_sd_forward` float DEFAULT NULL,
  `tail_bend_sd_forward_abs` float DEFAULT NULL,
  `tail_bend_sd_forward_neg` double DEFAULT NULL,
  `tail_bend_sd_forward_pos` float DEFAULT NULL,
  `tail_bend_sd_paused` double DEFAULT NULL,
  `tail_bend_sd_paused_abs` double DEFAULT NULL,
  `tail_bend_sd_paused_neg` double DEFAULT NULL,
  `tail_bend_sd_paused_pos` double DEFAULT NULL,
  `tail_bend_sd_backward` double DEFAULT NULL,
  `tail_bend_sd_backward_abs` double DEFAULT NULL,
  `tail_bend_sd_backward_neg` double DEFAULT NULL,
  `tail_bend_sd_backward_pos` double DEFAULT NULL,
  `max_amplitude` float DEFAULT NULL,
  `max_amplitude_forward` float DEFAULT NULL,
  `max_amplitude_paused` double DEFAULT NULL,
  `max_amplitude_backward` double DEFAULT NULL,
  `amplitude_ratio` float DEFAULT NULL,
  `amplitude_ratio_forward` float DEFAULT NULL,
  `amplitude_ratio_paused` double DEFAULT NULL,
  `amplitude_ratio_backward` double DEFAULT NULL,
  `primary_wavelength` float DEFAULT NULL,
  `primary_wavelength_forward` double DEFAULT NULL,
  `primary_wavelength_paused` double DEFAULT NULL,
  `primary_wavelength_backward` double DEFAULT NULL,
  `secondary_wavelength` double DEFAULT NULL,
  `secondary_wavelength_forward` double DEFAULT NULL,
  `secondary_wavelength_paused` double DEFAULT NULL,
  `secondary_wavelength_backward` double DEFAULT NULL,
  `track_length` float DEFAULT NULL,
  `track_length_forward` float DEFAULT NULL,
  `track_length_paused` double DEFAULT NULL,
  `track_length_backward` double DEFAULT NULL,
  `eccentricity` float DEFAULT NULL,
  `eccentricity_forward` float DEFAULT NULL,
  `eccentricity_paused` double DEFAULT NULL,
  `eccentricity_backward` double DEFAULT NULL,
  `bend_count` float DEFAULT NULL,
  `bend_count_forward` float DEFAULT NULL,
  `bend_count_paused` double DEFAULT NULL,
  `bend_count_backward` double DEFAULT NULL,
  `tail_to_head_orientation` float DEFAULT NULL,
  `tail_to_head_orientation_abs` float DEFAULT NULL,
  `tail_to_head_orientation_neg` float DEFAULT NULL,
  `tail_to_head_orientation_pos` float DEFAULT NULL,
  `tail_to_head_orientation_forward` float DEFAULT NULL,
  `tail_to_head_orientation_forward_abs` float DEFAULT NULL,
  `tail_to_head_orientation_forward_neg` double DEFAULT NULL,
  `tail_to_head_orientation_forward_pos` float DEFAULT NULL,
  `tail_to_head_orientation_paused` double DEFAULT NULL,
  `tail_to_head_orientation_paused_abs` double DEFAULT NULL,
  `tail_to_head_orientation_paused_neg` double DEFAULT NULL,
  `tail_to_head_orientation_paused_pos` double DEFAULT NULL,
  `tail_to_head_orientation_backward` double DEFAULT NULL,
  `tail_to_head_orientation_backward_abs` double DEFAULT NULL,
  `tail_to_head_orientation_backward_neg` double DEFAULT NULL,
  `tail_to_head_orientation_backward_pos` double DEFAULT NULL,
  `head_orientation` float DEFAULT NULL,
  `head_orientation_abs` float DEFAULT NULL,
  `head_orientation_neg` float DEFAULT NULL,
  `head_orientation_pos` float DEFAULT NULL,
  `head_orientation_forward` float DEFAULT NULL,
  `head_orientation_forward_abs` float DEFAULT NULL,
  `head_orientation_forward_neg` float DEFAULT NULL,
  `head_orientation_forward_pos` double DEFAULT NULL,
  `head_orientation_paused` double DEFAULT NULL,
  `head_orientation_paused_abs` double DEFAULT NULL,
  `head_orientation_paused_neg` double DEFAULT NULL,
  `head_orientation_paused_pos` double DEFAULT NULL,
  `head_orientation_backward` double DEFAULT NULL,
  `head_orientation_backward_abs` double DEFAULT NULL,
  `head_orientation_backward_neg` double DEFAULT NULL,
  `head_orientation_backward_pos` double DEFAULT NULL,
  `tail_orientation` float DEFAULT NULL,
  `tail_orientation_abs` float DEFAULT NULL,
  `tail_orientation_neg` float DEFAULT NULL,
  `tail_orientation_pos` float DEFAULT NULL,
  `tail_orientation_forward` float DEFAULT NULL,
  `tail_orientation_forward_abs` float DEFAULT NULL,
  `tail_orientation_forward_neg` float DEFAULT NULL,
  `tail_orientation_forward_pos` double DEFAULT NULL,
  `tail_orientation_paused` double DEFAULT NULL,
  `tail_orientation_paused_abs` double DEFAULT NULL,
  `tail_orientation_paused_neg` double DEFAULT NULL,
  `tail_orientation_paused_pos` double DEFAULT NULL,
  `tail_orientation_backward` double DEFAULT NULL,
  `tail_orientation_backward_abs` double DEFAULT NULL,
  `tail_orientation_backward_neg` double DEFAULT NULL,
  `tail_orientation_backward_pos` double DEFAULT NULL,
  `eigen_projection_1` float DEFAULT NULL,
  `eigen_projection_1_abs` float DEFAULT NULL,
  `eigen_projection_1_neg` float DEFAULT NULL,
  `eigen_projection_1_pos` float DEFAULT NULL,
  `eigen_projection_1_forward` float DEFAULT NULL,
  `eigen_projection_1_forward_abs` float DEFAULT NULL,
  `eigen_projection_1_forward_neg` double DEFAULT NULL,
  `eigen_projection_1_forward_pos` float DEFAULT NULL,
  `eigen_projection_1_paused` double DEFAULT NULL,
  `eigen_projection_1_paused_abs` double DEFAULT NULL,
  `eigen_projection_1_paused_neg` double DEFAULT NULL,
  `eigen_projection_1_paused_pos` double DEFAULT NULL,
  `eigen_projection_1_backward` double DEFAULT NULL,
  `eigen_projection_1_backward_abs` double DEFAULT NULL,
  `eigen_projection_1_backward_neg` double DEFAULT NULL,
  `eigen_projection_1_backward_pos` double DEFAULT NULL,
  `eigen_projection_2` float DEFAULT NULL,
  `eigen_projection_2_abs` float DEFAULT NULL,
  `eigen_projection_2_neg` float DEFAULT NULL,
  `eigen_projection_2_pos` float DEFAULT NULL,
  `eigen_projection_2_forward` float DEFAULT NULL,
  `eigen_projection_2_forward_abs` float DEFAULT NULL,
  `eigen_projection_2_forward_neg` double DEFAULT NULL,
  `eigen_projection_2_forward_pos` float DEFAULT NULL,
  `eigen_projection_2_paused` double DEFAULT NULL,
  `eigen_projection_2_paused_abs` double DEFAULT NULL,
  `eigen_projection_2_paused_neg` double DEFAULT NULL,
  `eigen_projection_2_paused_pos` double DEFAULT NULL,
  `eigen_projection_2_backward` double DEFAULT NULL,
  `eigen_projection_2_backward_abs` double DEFAULT NULL,
  `eigen_projection_2_backward_neg` double DEFAULT NULL,
  `eigen_projection_2_backward_pos` double DEFAULT NULL,
  `eigen_projection_3` float DEFAULT NULL,
  `eigen_projection_3_abs` float DEFAULT NULL,
  `eigen_projection_3_neg` float DEFAULT NULL,
  `eigen_projection_3_pos` float DEFAULT NULL,
  `eigen_projection_3_forward` float DEFAULT NULL,
  `eigen_projection_3_forward_abs` float DEFAULT NULL,
  `eigen_projection_3_forward_neg` float DEFAULT NULL,
  `eigen_projection_3_forward_pos` double DEFAULT NULL,
  `eigen_projection_3_paused` double DEFAULT NULL,
  `eigen_projection_3_paused_abs` double DEFAULT NULL,
  `eigen_projection_3_paused_neg` double DEFAULT NULL,
  `eigen_projection_3_paused_pos` double DEFAULT NULL,
  `eigen_projection_3_backward` double DEFAULT NULL,
  `eigen_projection_3_backward_abs` double DEFAULT NULL,
  `eigen_projection_3_backward_neg` double DEFAULT NULL,
  `eigen_projection_3_backward_pos` double DEFAULT NULL,
  `eigen_projection_4` float DEFAULT NULL,
  `eigen_projection_4_abs` float DEFAULT NULL,
  `eigen_projection_4_neg` float DEFAULT NULL,
  `eigen_projection_4_pos` float DEFAULT NULL,
  `eigen_projection_4_forward` float DEFAULT NULL,
  `eigen_projection_4_forward_abs` float DEFAULT NULL,
  `eigen_projection_4_forward_neg` float DEFAULT NULL,
  `eigen_projection_4_forward_pos` double DEFAULT NULL,
  `eigen_projection_4_paused` double DEFAULT NULL,
  `eigen_projection_4_paused_abs` double DEFAULT NULL,
  `eigen_projection_4_paused_neg` double DEFAULT NULL,
  `eigen_projection_4_paused_pos` double DEFAULT NULL,
  `eigen_projection_4_backward` double DEFAULT NULL,
  `eigen_projection_4_backward_abs` double DEFAULT NULL,
  `eigen_projection_4_backward_neg` double DEFAULT NULL,
  `eigen_projection_4_backward_pos` double DEFAULT NULL,
  `eigen_projection_5` float DEFAULT NULL,
  `eigen_projection_5_abs` float DEFAULT NULL,
  `eigen_projection_5_neg` float DEFAULT NULL,
  `eigen_projection_5_pos` float DEFAULT NULL,
  `eigen_projection_5_forward` float DEFAULT NULL,
  `eigen_projection_5_forward_abs` float DEFAULT NULL,
  `eigen_projection_5_forward_neg` float DEFAULT NULL,
  `eigen_projection_5_forward_pos` float DEFAULT NULL,
  `eigen_projection_5_paused` double DEFAULT NULL,
  `eigen_projection_5_paused_abs` double DEFAULT NULL,
  `eigen_projection_5_paused_neg` double DEFAULT NULL,
  `eigen_projection_5_paused_pos` double DEFAULT NULL,
  `eigen_projection_5_backward` double DEFAULT NULL,
  `eigen_projection_5_backward_abs` double DEFAULT NULL,
  `eigen_projection_5_backward_neg` double DEFAULT NULL,
  `eigen_projection_5_backward_pos` double DEFAULT NULL,
  `eigen_projection_6` float DEFAULT NULL,
  `eigen_projection_6_abs` float DEFAULT NULL,
  `eigen_projection_6_neg` float DEFAULT NULL,
  `eigen_projection_6_pos` float DEFAULT NULL,
  `eigen_projection_6_forward` float DEFAULT NULL,
  `eigen_projection_6_forward_abs` float DEFAULT NULL,
  `eigen_projection_6_forward_neg` double DEFAULT NULL,
  `eigen_projection_6_forward_pos` float DEFAULT NULL,
  `eigen_projection_6_paused` double DEFAULT NULL,
  `eigen_projection_6_paused_abs` double DEFAULT NULL,
  `eigen_projection_6_paused_neg` double DEFAULT NULL,
  `eigen_projection_6_paused_pos` double DEFAULT NULL,
  `eigen_projection_6_backward` double DEFAULT NULL,
  `eigen_projection_6_backward_abs` double DEFAULT NULL,
  `eigen_projection_6_backward_neg` double DEFAULT NULL,
  `eigen_projection_6_backward_pos` double DEFAULT NULL,
  `head_tip_speed` float DEFAULT NULL,
  `head_tip_speed_abs` float DEFAULT NULL,
  `head_tip_speed_neg` float DEFAULT NULL,
  `head_tip_speed_pos` float DEFAULT NULL,
  `head_tip_speed_forward` float DEFAULT NULL,
  `head_tip_speed_forward_abs` float DEFAULT NULL,
  `head_tip_speed_forward_neg` float DEFAULT NULL,
  `head_tip_speed_forward_pos` float DEFAULT NULL,
  `head_tip_speed_paused` double DEFAULT NULL,
  `head_tip_speed_paused_abs` double DEFAULT NULL,
  `head_tip_speed_paused_neg` double DEFAULT NULL,
  `head_tip_speed_paused_pos` double DEFAULT NULL,
  `head_tip_speed_backward` double DEFAULT NULL,
  `head_tip_speed_backward_abs` double DEFAULT NULL,
  `head_tip_speed_backward_neg` double DEFAULT NULL,
  `head_tip_speed_backward_pos` double DEFAULT NULL,
  `head_speed` float DEFAULT NULL,
  `head_speed_abs` float DEFAULT NULL,
  `head_speed_neg` float DEFAULT NULL,
  `head_speed_pos` float DEFAULT NULL,
  `head_speed_forward` float DEFAULT NULL,
  `head_speed_forward_abs` float DEFAULT NULL,
  `head_speed_forward_neg` float DEFAULT NULL,
  `head_speed_forward_pos` float DEFAULT NULL,
  `head_speed_paused` double DEFAULT NULL,
  `head_speed_paused_abs` double DEFAULT NULL,
  `head_speed_paused_neg` double DEFAULT NULL,
  `head_speed_paused_pos` double DEFAULT NULL,
  `head_speed_backward` double DEFAULT NULL,
  `head_speed_backward_abs` double DEFAULT NULL,
  `head_speed_backward_neg` double DEFAULT NULL,
  `head_speed_backward_pos` double DEFAULT NULL,
  `midbody_speed` float DEFAULT NULL,
  `midbody_speed_abs` float DEFAULT NULL,
  `midbody_speed_neg` float DEFAULT NULL,
  `midbody_speed_pos` float DEFAULT NULL,
  `midbody_speed_forward` float DEFAULT NULL,
  `midbody_speed_forward_abs` float DEFAULT NULL,
  `midbody_speed_forward_neg` double DEFAULT NULL,
  `midbody_speed_forward_pos` float DEFAULT NULL,
  `midbody_speed_paused` double DEFAULT NULL,
  `midbody_speed_paused_abs` double DEFAULT NULL,
  `midbody_speed_paused_neg` double DEFAULT NULL,
  `midbody_speed_paused_pos` double DEFAULT NULL,
  `midbody_speed_backward` double DEFAULT NULL,
  `midbody_speed_backward_abs` double DEFAULT NULL,
  `midbody_speed_backward_neg` double DEFAULT NULL,
  `midbody_speed_backward_pos` double DEFAULT NULL,
  `tail_speed` float DEFAULT NULL,
  `tail_speed_abs` float DEFAULT NULL,
  `tail_speed_neg` float DEFAULT NULL,
  `tail_speed_pos` float DEFAULT NULL,
  `tail_speed_forward` float DEFAULT NULL,
  `tail_speed_forward_abs` float DEFAULT NULL,
  `tail_speed_forward_neg` double DEFAULT NULL,
  `tail_speed_forward_pos` double DEFAULT NULL,
  `tail_speed_paused` double DEFAULT NULL,
  `tail_speed_paused_abs` double DEFAULT NULL,
  `tail_speed_paused_neg` double DEFAULT NULL,
  `tail_speed_paused_pos` double DEFAULT NULL,
  `tail_speed_backward` double DEFAULT NULL,
  `tail_speed_backward_abs` double DEFAULT NULL,
  `tail_speed_backward_neg` double DEFAULT NULL,
  `tail_speed_backward_pos` double DEFAULT NULL,
  `tail_tip_speed` float DEFAULT NULL,
  `tail_tip_speed_abs` float DEFAULT NULL,
  `tail_tip_speed_neg` float DEFAULT NULL,
  `tail_tip_speed_pos` float DEFAULT NULL,
  `tail_tip_speed_forward` float DEFAULT NULL,
  `tail_tip_speed_forward_abs` float DEFAULT NULL,
  `tail_tip_speed_forward_neg` float DEFAULT NULL,
  `tail_tip_speed_forward_pos` double DEFAULT NULL,
  `tail_tip_speed_paused` double DEFAULT NULL,
  `tail_tip_speed_paused_abs` double DEFAULT NULL,
  `tail_tip_speed_paused_neg` double DEFAULT NULL,
  `tail_tip_speed_paused_pos` double DEFAULT NULL,
  `tail_tip_speed_backward` double DEFAULT NULL,
  `tail_tip_speed_backward_abs` double DEFAULT NULL,
  `tail_tip_speed_backward_neg` double DEFAULT NULL,
  `tail_tip_speed_backward_pos` double DEFAULT NULL,
  `head_tip_motion_direction` float DEFAULT NULL,
  `head_tip_motion_direction_abs` float DEFAULT NULL,
  `head_tip_motion_direction_neg` float DEFAULT NULL,
  `head_tip_motion_direction_pos` float DEFAULT NULL,
  `head_tip_motion_direction_forward` float DEFAULT NULL,
  `head_tip_motion_direction_forward_abs` float DEFAULT NULL,
  `head_tip_motion_direction_forward_neg` float DEFAULT NULL,
  `head_tip_motion_direction_forward_pos` float DEFAULT NULL,
  `head_tip_motion_direction_paused` double DEFAULT NULL,
  `head_tip_motion_direction_paused_abs` double DEFAULT NULL,
  `head_tip_motion_direction_paused_neg` double DEFAULT NULL,
  `head_tip_motion_direction_paused_pos` double DEFAULT NULL,
  `head_tip_motion_direction_backward` double DEFAULT NULL,
  `head_tip_motion_direction_backward_abs` double DEFAULT NULL,
  `head_tip_motion_direction_backward_neg` double DEFAULT NULL,
  `head_tip_motion_direction_backward_pos` double DEFAULT NULL,
  `head_motion_direction` float DEFAULT NULL,
  `head_motion_direction_abs` float DEFAULT NULL,
  `head_motion_direction_neg` float DEFAULT NULL,
  `head_motion_direction_pos` float DEFAULT NULL,
  `head_motion_direction_forward` float DEFAULT NULL,
  `head_motion_direction_forward_abs` float DEFAULT NULL,
  `head_motion_direction_forward_neg` float DEFAULT NULL,
  `head_motion_direction_forward_pos` float DEFAULT NULL,
  `head_motion_direction_paused` double DEFAULT NULL,
  `head_motion_direction_paused_abs` double DEFAULT NULL,
  `head_motion_direction_paused_neg` double DEFAULT NULL,
  `head_motion_direction_paused_pos` double DEFAULT NULL,
  `head_motion_direction_backward` double DEFAULT NULL,
  `head_motion_direction_backward_abs` double DEFAULT NULL,
  `head_motion_direction_backward_neg` double DEFAULT NULL,
  `head_motion_direction_backward_pos` double DEFAULT NULL,
  `midbody_motion_direction` float DEFAULT NULL,
  `midbody_motion_direction_abs` float DEFAULT NULL,
  `midbody_motion_direction_neg` float DEFAULT NULL,
  `midbody_motion_direction_pos` float DEFAULT NULL,
  `midbody_motion_direction_forward` float DEFAULT NULL,
  `midbody_motion_direction_forward_abs` float DEFAULT NULL,
  `midbody_motion_direction_forward_neg` float DEFAULT NULL,
  `midbody_motion_direction_forward_pos` float DEFAULT NULL,
  `midbody_motion_direction_paused` double DEFAULT NULL,
  `midbody_motion_direction_paused_abs` double DEFAULT NULL,
  `midbody_motion_direction_paused_neg` double DEFAULT NULL,
  `midbody_motion_direction_paused_pos` double DEFAULT NULL,
  `midbody_motion_direction_backward` double DEFAULT NULL,
  `midbody_motion_direction_backward_abs` double DEFAULT NULL,
  `midbody_motion_direction_backward_neg` double DEFAULT NULL,
  `midbody_motion_direction_backward_pos` double DEFAULT NULL,
  `tail_motion_direction` float DEFAULT NULL,
  `tail_motion_direction_abs` float DEFAULT NULL,
  `tail_motion_direction_neg` float DEFAULT NULL,
  `tail_motion_direction_pos` float DEFAULT NULL,
  `tail_motion_direction_forward` float DEFAULT NULL,
  `tail_motion_direction_forward_abs` float DEFAULT NULL,
  `tail_motion_direction_forward_neg` double DEFAULT NULL,
  `tail_motion_direction_forward_pos` float DEFAULT NULL,
  `tail_motion_direction_paused` double DEFAULT NULL,
  `tail_motion_direction_paused_abs` double DEFAULT NULL,
  `tail_motion_direction_paused_neg` double DEFAULT NULL,
  `tail_motion_direction_paused_pos` double DEFAULT NULL,
  `tail_motion_direction_backward` double DEFAULT NULL,
  `tail_motion_direction_backward_abs` double DEFAULT NULL,
  `tail_motion_direction_backward_neg` double DEFAULT NULL,
  `tail_motion_direction_backward_pos` double DEFAULT NULL,
  `tail_tip_motion_direction` float DEFAULT NULL,
  `tail_tip_motion_direction_abs` float DEFAULT NULL,
  `tail_tip_motion_direction_neg` float DEFAULT NULL,
  `tail_tip_motion_direction_pos` float DEFAULT NULL,
  `tail_tip_motion_direction_forward` float DEFAULT NULL,
  `tail_tip_motion_direction_forward_abs` float DEFAULT NULL,
  `tail_tip_motion_direction_forward_neg` float DEFAULT NULL,
  `tail_tip_motion_direction_forward_pos` float DEFAULT NULL,
  `tail_tip_motion_direction_paused` double DEFAULT NULL,
  `tail_tip_motion_direction_paused_abs` double DEFAULT NULL,
  `tail_tip_motion_direction_paused_neg` double DEFAULT NULL,
  `tail_tip_motion_direction_paused_pos` double DEFAULT NULL,
  `tail_tip_motion_direction_backward` double DEFAULT NULL,
  `tail_tip_motion_direction_backward_abs` double DEFAULT NULL,
  `tail_tip_motion_direction_backward_neg` double DEFAULT NULL,
  `tail_tip_motion_direction_backward_pos` double DEFAULT NULL,
  `foraging_amplitude` float DEFAULT NULL,
  `foraging_amplitude_abs` float DEFAULT NULL,
  `foraging_amplitude_neg` float DEFAULT NULL,
  `foraging_amplitude_pos` float DEFAULT NULL,
  `foraging_amplitude_forward` float DEFAULT NULL,
  `foraging_amplitude_forward_abs` float DEFAULT NULL,
  `foraging_amplitude_forward_neg` float DEFAULT NULL,
  `foraging_amplitude_forward_pos` float DEFAULT NULL,
  `foraging_amplitude_paused` double DEFAULT NULL,
  `foraging_amplitude_paused_abs` double DEFAULT NULL,
  `foraging_amplitude_paused_neg` double DEFAULT NULL,
  `foraging_amplitude_paused_pos` double DEFAULT NULL,
  `foraging_amplitude_backward` double DEFAULT NULL,
  `foraging_amplitude_backward_abs` double DEFAULT NULL,
  `foraging_amplitude_backward_neg` double DEFAULT NULL,
  `foraging_amplitude_backward_pos` double DEFAULT NULL,
  `foraging_speed` float DEFAULT NULL,
  `foraging_speed_abs` float DEFAULT NULL,
  `foraging_speed_neg` float DEFAULT NULL,
  `foraging_speed_pos` float DEFAULT NULL,
  `foraging_speed_forward` float DEFAULT NULL,
  `foraging_speed_forward_abs` float DEFAULT NULL,
  `foraging_speed_forward_neg` float DEFAULT NULL,
  `foraging_speed_forward_pos` float DEFAULT NULL,
  `foraging_speed_paused` double DEFAULT NULL,
  `foraging_speed_paused_abs` double DEFAULT NULL,
  `foraging_speed_paused_neg` double DEFAULT NULL,
  `foraging_speed_paused_pos` double DEFAULT NULL,
  `foraging_speed_backward` double DEFAULT NULL,
  `foraging_speed_backward_abs` double DEFAULT NULL,
  `foraging_speed_backward_neg` double DEFAULT NULL,
  `foraging_speed_backward_pos` double DEFAULT NULL,
  `head_crawling_amplitude` float DEFAULT NULL,
  `head_crawling_amplitude_abs` float DEFAULT NULL,
  `head_crawling_amplitude_neg` float DEFAULT NULL,
  `head_crawling_amplitude_pos` float DEFAULT NULL,
  `head_crawling_amplitude_forward` double DEFAULT NULL,
  `head_crawling_amplitude_forward_abs` double DEFAULT NULL,
  `head_crawling_amplitude_forward_neg` double DEFAULT NULL,
  `head_crawling_amplitude_forward_pos` double DEFAULT NULL,
  `head_crawling_amplitude_paused` double DEFAULT NULL,
  `head_crawling_amplitude_paused_abs` double DEFAULT NULL,
  `head_crawling_amplitude_paused_neg` double DEFAULT NULL,
  `head_crawling_amplitude_paused_pos` double DEFAULT NULL,
  `head_crawling_amplitude_backward` double DEFAULT NULL,
  `head_crawling_amplitude_backward_abs` double DEFAULT NULL,
  `head_crawling_amplitude_backward_neg` double DEFAULT NULL,
  `head_crawling_amplitude_backward_pos` double DEFAULT NULL,
  `midbody_crawling_amplitude` float DEFAULT NULL,
  `midbody_crawling_amplitude_abs` float DEFAULT NULL,
  `midbody_crawling_amplitude_neg` float DEFAULT NULL,
  `midbody_crawling_amplitude_pos` float DEFAULT NULL,
  `midbody_crawling_amplitude_forward` float DEFAULT NULL,
  `midbody_crawling_amplitude_forward_abs` float DEFAULT NULL,
  `midbody_crawling_amplitude_forward_neg` float DEFAULT NULL,
  `midbody_crawling_amplitude_forward_pos` double DEFAULT NULL,
  `midbody_crawling_amplitude_paused` double DEFAULT NULL,
  `midbody_crawling_amplitude_paused_abs` double DEFAULT NULL,
  `midbody_crawling_amplitude_paused_neg` double DEFAULT NULL,
  `midbody_crawling_amplitude_paused_pos` double DEFAULT NULL,
  `midbody_crawling_amplitude_backward` double DEFAULT NULL,
  `midbody_crawling_amplitude_backward_abs` double DEFAULT NULL,
  `midbody_crawling_amplitude_backward_neg` double DEFAULT NULL,
  `midbody_crawling_amplitude_backward_pos` double DEFAULT NULL,
  `tail_crawling_amplitude` float DEFAULT NULL,
  `tail_crawling_amplitude_abs` float DEFAULT NULL,
  `tail_crawling_amplitude_neg` float DEFAULT NULL,
  `tail_crawling_amplitude_pos` float DEFAULT NULL,
  `tail_crawling_amplitude_forward` double DEFAULT NULL,
  `tail_crawling_amplitude_forward_abs` double DEFAULT NULL,
  `tail_crawling_amplitude_forward_neg` double DEFAULT NULL,
  `tail_crawling_amplitude_forward_pos` double DEFAULT NULL,
  `tail_crawling_amplitude_paused` double DEFAULT NULL,
  `tail_crawling_amplitude_paused_abs` double DEFAULT NULL,
  `tail_crawling_amplitude_paused_neg` double DEFAULT NULL,
  `tail_crawling_amplitude_paused_pos` double DEFAULT NULL,
  `tail_crawling_amplitude_backward` double DEFAULT NULL,
  `tail_crawling_amplitude_backward_abs` double DEFAULT NULL,
  `tail_crawling_amplitude_backward_neg` double DEFAULT NULL,
  `tail_crawling_amplitude_backward_pos` double DEFAULT NULL,
  `head_crawling_frequency` float DEFAULT NULL,
  `head_crawling_frequency_abs` float DEFAULT NULL,
  `head_crawling_frequency_neg` float DEFAULT NULL,
  `head_crawling_frequency_pos` float DEFAULT NULL,
  `head_crawling_frequency_forward` double DEFAULT NULL,
  `head_crawling_frequency_forward_abs` double DEFAULT NULL,
  `head_crawling_frequency_forward_neg` double DEFAULT NULL,
  `head_crawling_frequency_forward_pos` double DEFAULT NULL,
  `head_crawling_frequency_paused` double DEFAULT NULL,
  `head_crawling_frequency_paused_abs` double DEFAULT NULL,
  `head_crawling_frequency_paused_neg` double DEFAULT NULL,
  `head_crawling_frequency_paused_pos` double DEFAULT NULL,
  `head_crawling_frequency_backward` double DEFAULT NULL,
  `head_crawling_frequency_backward_abs` double DEFAULT NULL,
  `head_crawling_frequency_backward_neg` double DEFAULT NULL,
  `head_crawling_frequency_backward_pos` double DEFAULT NULL,
  `midbody_crawling_frequency` float DEFAULT NULL,
  `midbody_crawling_frequency_abs` float DEFAULT NULL,
  `midbody_crawling_frequency_neg` float DEFAULT NULL,
  `midbody_crawling_frequency_pos` float DEFAULT NULL,
  `midbody_crawling_frequency_forward` float DEFAULT NULL,
  `midbody_crawling_frequency_forward_abs` float DEFAULT NULL,
  `midbody_crawling_frequency_forward_neg` float DEFAULT NULL,
  `midbody_crawling_frequency_forward_pos` double DEFAULT NULL,
  `midbody_crawling_frequency_paused` double DEFAULT NULL,
  `midbody_crawling_frequency_paused_abs` double DEFAULT NULL,
  `midbody_crawling_frequency_paused_neg` double DEFAULT NULL,
  `midbody_crawling_frequency_paused_pos` double DEFAULT NULL,
  `midbody_crawling_frequency_backward` double DEFAULT NULL,
  `midbody_crawling_frequency_backward_abs` double DEFAULT NULL,
  `midbody_crawling_frequency_backward_neg` double DEFAULT NULL,
  `midbody_crawling_frequency_backward_pos` double DEFAULT NULL,
  `tail_crawling_frequency` float DEFAULT NULL,
  `tail_crawling_frequency_abs` float DEFAULT NULL,
  `tail_crawling_frequency_neg` float DEFAULT NULL,
  `tail_crawling_frequency_pos` float DEFAULT NULL,
  `tail_crawling_frequency_forward` double DEFAULT NULL,
  `tail_crawling_frequency_forward_abs` double DEFAULT NULL,
  `tail_crawling_frequency_forward_neg` double DEFAULT NULL,
  `tail_crawling_frequency_forward_pos` double DEFAULT NULL,
  `tail_crawling_frequency_paused` double DEFAULT NULL,
  `tail_crawling_frequency_paused_abs` double DEFAULT NULL,
  `tail_crawling_frequency_paused_neg` double DEFAULT NULL,
  `tail_crawling_frequency_paused_pos` double DEFAULT NULL,
  `tail_crawling_frequency_backward` double DEFAULT NULL,
  `tail_crawling_frequency_backward_abs` double DEFAULT NULL,
  `tail_crawling_frequency_backward_neg` double DEFAULT NULL,
  `tail_crawling_frequency_backward_pos` double DEFAULT NULL,
  `path_range` float DEFAULT NULL,
  `path_range_forward` float DEFAULT NULL,
  `path_range_paused` double DEFAULT NULL,
  `path_range_backward` double DEFAULT NULL,
  `path_curvature` float DEFAULT NULL,
  `path_curvature_abs` float DEFAULT NULL,
  `path_curvature_neg` float DEFAULT NULL,
  `path_curvature_pos` float DEFAULT NULL,
  `path_curvature_forward` float DEFAULT NULL,
  `path_curvature_forward_abs` float DEFAULT NULL,
  `path_curvature_forward_neg` float DEFAULT NULL,
  `path_curvature_forward_pos` float DEFAULT NULL,
  `path_curvature_paused` double DEFAULT NULL,
  `path_curvature_paused_abs` double DEFAULT NULL,
  `path_curvature_paused_neg` double DEFAULT NULL,
  `path_curvature_paused_pos` double DEFAULT NULL,
  `path_curvature_backward` double DEFAULT NULL,
  `path_curvature_backward_abs` double DEFAULT NULL,
  `path_curvature_backward_neg` double DEFAULT NULL,
  `path_curvature_backward_pos` double DEFAULT NULL,
  `coil_time` double DEFAULT NULL,
  `inter_coil_time` double DEFAULT NULL,
  `inter_coil_distance` double DEFAULT NULL,
  `coils_frequency` double DEFAULT NULL,
  `coils_time_ratio` double DEFAULT NULL,
  `omega_turn_time` double DEFAULT NULL,
  `omega_turn_time_abs` double DEFAULT NULL,
  `omega_turn_time_neg` double DEFAULT NULL,
  `omega_turn_time_pos` double DEFAULT NULL,
  `inter_omega_time` double DEFAULT NULL,
  `inter_omega_time_abs` double DEFAULT NULL,
  `inter_omega_time_neg` double DEFAULT NULL,
  `inter_omega_time_pos` double DEFAULT NULL,
  `inter_omega_distance` double DEFAULT NULL,
  `inter_omega_distance_abs` double DEFAULT NULL,
  `inter_omega_distance_neg` double DEFAULT NULL,
  `inter_omega_distance_pos` double DEFAULT NULL,
  `omega_turns_frequency` double DEFAULT NULL,
  `omega_turns_time_ratio` double DEFAULT NULL,
  `upsilon_turn_time` double DEFAULT NULL,
  `upsilon_turn_time_abs` double DEFAULT NULL,
  `upsilon_turn_time_neg` double DEFAULT NULL,
  `upsilon_turn_time_pos` double DEFAULT NULL,
  `inter_upsilon_time` double DEFAULT NULL,
  `inter_upsilon_time_abs` double DEFAULT NULL,
  `inter_upsilon_time_neg` double DEFAULT NULL,
  `inter_upsilon_time_pos` double DEFAULT NULL,
  `inter_upsilon_distance` double DEFAULT NULL,
  `inter_upsilon_distance_abs` double DEFAULT NULL,
  `inter_upsilon_distance_neg` double DEFAULT NULL,
  `inter_upsilon_distance_pos` double DEFAULT NULL,
  `upsilon_turns_frequency` double DEFAULT NULL,
  `upsilon_turns_time_ratio` double DEFAULT NULL,
  `forward_time` float DEFAULT NULL,
  `forward_distance` float DEFAULT NULL,
  `inter_forward_time` double DEFAULT NULL,
  `inter_forward_distance` double DEFAULT NULL,
  `forward_motion_frequency` float DEFAULT NULL,
  `forward_motion_time_ratio` float DEFAULT NULL,
  `forward_motion_distance_ratio` float DEFAULT NULL,
  `paused_time` double DEFAULT NULL,
  `paused_distance` double DEFAULT NULL,
  `inter_paused_time` double DEFAULT NULL,
  `inter_paused_distance` double DEFAULT NULL,
  `paused_motion_frequency` double DEFAULT NULL,
  `paused_motion_time_ratio` double DEFAULT NULL,
  `paused_motion_distance_ratio` double DEFAULT NULL,
  `backward_time` double DEFAULT NULL,
  `backward_distance` double DEFAULT NULL,
  `inter_backward_time` double DEFAULT NULL,
  `inter_backward_distance` double DEFAULT NULL,
  `backward_motion_frequency` double DEFAULT NULL,
  `backward_motion_time_ratio` double DEFAULT NULL,
  `backward_motion_distance_ratio` double DEFAULT NULL,
  UNIQUE KEY `u_experiment_id` (`experiment_id`),
  CONSTRAINT `features_means_ibfk_1` FOREIGN KEY (`experiment_id`) REFERENCES `experiments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foods`
--

DROP TABLE IF EXISTS `foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `foods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genes`
--

DROP TABLE IF EXISTS `genes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=321 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `habituations`
--

DROP TABLE IF EXISTS `habituations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `habituations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `results_summary`
--

DROP TABLE IF EXISTS `results_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `results_summary` (
  `experiment_id` int(11) NOT NULL,
  `n_valid_frames` int(11) DEFAULT NULL,
  `n_missing_frames` int(11) DEFAULT NULL,
  `n_segmented_skeletons` int(11) DEFAULT NULL,
  `n_filtered_skeletons` int(11) DEFAULT NULL,
  `n_valid_skeletons` int(11) DEFAULT NULL,
  `n_timestamps` int(11) DEFAULT NULL,
  `first_skel_frame` int(11) DEFAULT NULL,
  `last_skel_frame` int(11) DEFAULT NULL,
  `fps` float DEFAULT NULL,
  `total_time` float DEFAULT NULL,
  `mask_file_sizeMB` float DEFAULT NULL,
  PRIMARY KEY (`experiment_id`),
  CONSTRAINT `results_summary_ibfk_1` FOREIGN KEY (`experiment_id`) REFERENCES `experiments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `segworm_comparisons`
--

DROP TABLE IF EXISTS `segworm_comparisons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `segworm_comparisons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `experiment_id` int(11) NOT NULL,
  `segworm_feature_id` int(11) NOT NULL,
  `n_mutual_skeletons` int(11) DEFAULT NULL,
  `error_05th` float DEFAULT NULL,
  `error_50th` float DEFAULT NULL,
  `error_95th` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `experiment_id` (`experiment_id`),
  KEY `segworm_feature_id` (`segworm_feature_id`),
  CONSTRAINT `segworm_comparisons_ibfk_1` FOREIGN KEY (`experiment_id`) REFERENCES `experiments` (`id`),
  CONSTRAINT `segworm_comparisons_ibfk_2` FOREIGN KEY (`segworm_feature_id`) REFERENCES `segworm_info` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `segworm_info`
--

DROP TABLE IF EXISTS `segworm_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `segworm_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `segworm_file` varchar(700) DEFAULT NULL,
  `experiment_id` int(11) DEFAULT NULL,
  `fps` float DEFAULT NULL,
  `total_time` float DEFAULT NULL,
  `n_segworm_skeletons` int(11) DEFAULT NULL,
  `n_timestamps` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `experiment_id` (`experiment_id`),
  CONSTRAINT `segworm_info_ibfk_1` FOREIGN KEY (`experiment_id`) REFERENCES `experiments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sexes`
--

DROP TABLE IF EXISTS `sexes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sexes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `strains`
--

DROP TABLE IF EXISTS `strains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `strains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `gene_id` int(11) NOT NULL,
  `allele_id` int(11) NOT NULL,
  `chromosome_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `gene_id` (`gene_id`),
  KEY `allele_id` (`allele_id`),
  CONSTRAINT `strains_ibfk_1` FOREIGN KEY (`gene_id`) REFERENCES `genes` (`id`),
  CONSTRAINT `strains_ibfk_2` FOREIGN KEY (`allele_id`) REFERENCES `alleles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=378 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trackers`
--

DROP TABLE IF EXISTS `trackers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trackers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ventral_sides`
--

DROP TABLE IF EXISTS `ventral_sides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventral_sides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `experiments_full`
--

/*!50001 DROP VIEW IF EXISTS `experiments_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `experiments_full` AS select `e`.`id` AS `id`,`e`.`base_name` AS `base_name`,`e`.`date` AS `date`,`e`.`original_video` AS `original_video`,`e`.`original_video_sizeMB` AS `original_video_sizeMB`,`e`.`results_dir` AS `results_dir`,`s`.`name` AS `strain`,`s`.`description` AS `strain_description`,`a`.`name` AS `allele`,`g`.`name` AS `gene`,`c`.`name` AS `chromosome`,`t`.`name` AS `tracker`,`sex`.`name` AS `sex`,`ds`.`name` AS `developmental_stage`,`vs`.`name` AS `ventral_side`,`f`.`name` AS `food`,`h`.`name` AS `habituation`,`experimenters`.`name` AS `experimenter`,`arenas`.`name` AS `arena`,`exit_flags`.`name` AS `exit_flag` from (((((((((((((`experiments` `e` left join `strains` `s` on((`e`.`strain_id` = `s`.`id`))) left join `alleles` `a` on((`s`.`allele_id` = `a`.`id`))) left join `genes` `g` on((`s`.`gene_id` = `g`.`id`))) left join `chromosomes` `c` on((`s`.`chromosome_id` = `c`.`id`))) left join `trackers` `t` on((`e`.`tracker_id` = `t`.`id`))) left join `sexes` `sex` on((`e`.`sex_id` = `sex`.`id`))) left join `developmental_stages` `ds` on((`e`.`developmental_stage_id` = `ds`.`id`))) left join `ventral_sides` `vs` on((`e`.`ventral_side_id` = `vs`.`id`))) left join `foods` `f` on((`e`.`food_id` = `f`.`id`))) left join `habituations` `h` on((`e`.`habituation_id` = `h`.`id`))) left join `experimenters` on((`e`.`experimenter_id` = `experimenters`.`id`))) left join `arenas` on((`e`.`arena_id` = `arenas`.`id`))) left join `exit_flags` on((`e`.`exit_flag_id` = `exit_flags`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-05-11 15:46:48
