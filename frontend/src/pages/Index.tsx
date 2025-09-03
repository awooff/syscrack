import Layout from '../components/Layout';
import { Card, Col, Row, Container } from 'react-bootstrap';

export default function Index() {
    return (
        <Layout>
            <Container className="mt-5">
                <Row className="text-center mb-4">
                    <Col>
                        <h1 className="title">Welcome to Syscrack</h1>
                        <p className="subtitle">The Virtual Online Crime Simliator!</p>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title>About the Game</Card.Title>
                                <Card.Text>
                                    Dive into a world of virtual crime where strategy and skill are your best allies.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Features</Card.Title>
                                <Card.Text>
                                    <li> Engaging gameplay </li>
                                    <li> Mlitiple scenarios </li>
                                    <li> Realistic simliations </li>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Get Started</Card.Title>
                                <Card.Text>
                                    Build your empire. Hack the planet.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
