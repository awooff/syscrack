import React, { useContext } from 'react'
import Layout from '../../components/Layout'
import { Card, Col, Row, Button } from 'react-bootstrap'
import axios from 'axios'
import SessionContext from '../../contexts/session.context'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
	const session = useContext(SessionContext);
	const navigate = useNavigate();
  return (
	  <Layout>
		  <Row>
			  <Col>
				  <Card body className="text-center bg-transparent border border-danger text-white">
					  Are you sure you want to log off?

					  <div className="d-grid mt-4">
						  <Button variant="danger" onClick={async () => {
							  	await axios.get('http://localhost:1337/auth/logout', {
									withCredentials: true,
									headers: {
										Authorization: "Bearer " + localStorage.getItem('jwt')
									}
								})
							  	session.load()
							  	navigate('/')
						  }}>Logoff</Button>
					  </div>
				  </Card>
			  </Col>
		  </Row>
	</Layout>
  )
}
