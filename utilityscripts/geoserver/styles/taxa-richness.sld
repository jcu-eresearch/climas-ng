<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Taxa richness</Name>
    <UserStyle>
      <Title>Taxa Richness</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.7</Opacity>
            <ColorMap>
              <ColorMapEntry color="#ffffff" opacity="0" quantity="-1"/>
<!-- 
              <ColorMapEntry color="#ffffff" opacity="1" quantity="0"/>
              <ColorMapEntry color="#9900ff" opacity="1" quantity="750"/>
 -->

              <ColorMapEntry color="#ffffff" opacity="0" quantity="0"/>
              <ColorMapEntry color="#eeddaa" opacity="1" quantity="1"/>
              <ColorMapEntry color="#bb7700" opacity="1" quantity="5"/>
              <ColorMapEntry color="#99ff33" opacity="1" quantity="15"/>
              <ColorMapEntry color="#66cc18" opacity="1" quantity="25"/>
              <ColorMapEntry color="#339900" opacity="1" quantity="50"/>
              <ColorMapEntry color="#116600" opacity="1" quantity="250"/>
              <ColorMapEntry color="#001166" opacity="1" quantity="750"/>
              <ColorMapEntry color="#660066" opacity="1" quantity="1500"/>
              <ColorMapEntry color="#ff00ff" opacity="1" quantity="5000"/>

<!--
              <ColorMapEntry color="#ffffff" opacity="0" quantity="-1"/>
              <ColorMapEntry color="#ffffff" opacity="1" quantity="0"/>
              <ColorMapEntry color="#eeccff" opacity="1" quantity="4"/>
              <ColorMapEntry color="#dd99ff" opacity="1" quantity="16"/>
              <ColorMapEntry color="#cc77ff" opacity="1" quantity="64"/>
              <ColorMapEntry color="#bb55ff" opacity="1" quantity="256"/>
              <ColorMapEntry color="#aa33ff" opacity="1" quantity="1024"/>
              <ColorMapEntry color="#9900ff" opacity="1" quantity="4096"/>
 -->

            </ColorMap>
            </RasterSymbolizer>
          </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
