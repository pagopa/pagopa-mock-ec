#!/bin/bash

ENV=dev
IMAGE_VERSION="1.6.13"

clean (){
  #$> clean "helm"
  CHART_PATH=$1
  rm -rf ${CHART_PATH}/charts
  rm -f ${CHART_PATH}/Chart.lock
}

fixVersion () {
  #$> fixAppVersion "helm/Chart.yaml"
  CHART_FILE=$1
  if [[ -f "$CHART_FILE" ]]; then
    yq -i ".appVersion = \"${IMAGE_VERSION}\"" "$CHART_FILE"
  fi
}

########## APP ############
helm uninstall --namespace nodo pagopamockec
clean "helm"

helm repo add microservice-chart https://pagopa.github.io/aks-microservice-chart-blueprint
helm dep build helm

fixVersion "helm/Chart.yaml"

helm upgrade --install --namespace nodo \
    --values helm/values-${ENV}.yaml \
    pagopamockec helm
