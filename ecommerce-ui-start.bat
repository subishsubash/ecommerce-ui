docker build -t emi-calculator-ui .
docker run -p 8080:80 --name emi-calculator-ui-container -d emi-calculator-ui
exit