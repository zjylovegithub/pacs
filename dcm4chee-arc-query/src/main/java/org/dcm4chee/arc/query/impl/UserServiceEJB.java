/*
 * *** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is part of dcm4che, an implementation of DICOM(TM) in
 * Java(TM), hosted at https://github.com/dcm4che.
 *
 * The Initial Developer of the Original Code is
 * J4Care.
 * Portions created by the Initial Developer are Copyright (C) 2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * See @authors listed below
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * *** END LICENSE BLOCK *****
 */

package org.dcm4chee.arc.query.impl;

import java.util.List;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import org.apache.commons.codec.digest.DigestUtils;
import org.dcm4chee.arc.entity.User;
import org.dcm4chee.arc.query.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Stateless
public class UserServiceEJB implements UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserServiceEJB.class);

    @PersistenceContext(unitName="dcm4chee-arc")
    private EntityManager em;   

	@Override
	public List<User> findUserList(User user) {
		TypedQuery<User> query = em.createNamedQuery(User.FIND_USER_LIST, User.class);
		
		return null;
	}
	
	@Override
	public boolean checkUser(User user) {
		//String password = DigestUtils.sha1Hex(user.getPassWd().getBytes());
		TypedQuery<User> query = em.createNamedQuery(User.CHECK_USER, User.class)
		.setParameter(1, user.getUserId())		
        .setParameter(2, user.getPassWd());		
		
		User result = null;
		try {
			result = query.getSingleResult();
		} catch (NoResultException e) {
			LOG.error("user.userId" + user.getUserId() + "user.passWd" + user.getPassWd() + ",result null");
		} catch (Exception e) {
			e.printStackTrace();			
		}
		LOG.info("reusult" + result);
		if(null != result) {
			return true;
		}		
		return false;
	}

}